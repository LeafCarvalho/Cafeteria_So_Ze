import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/Context/CartContext";
import { pedidosService } from "@/services/pedidosService";
import type { CartItem, PedidoResumoItem } from "@/types/pedidos";
import { DefaultButton } from "@/Utils/Buttons/Buttons";
import "./style.scss";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const IDEMPOTENCY_STORAGE_KEY = "cafeteria:pedido:chave-idempotencia";

const createIdempotencyKey = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const randomValue = Math.floor(Math.random() * 16);
      const hexadecimalValue =
        character === "x" ? randomValue : (randomValue & 0x3) | 0x8;
      return hexadecimalValue.toString(16);
    },
  );
};

const Pedidos: React.FC = () => {
  const {
    itemQuantities,
    cartProducts,
    setItemQuantities,
    setLastOrderConfirmation,
    setConfirmationAccessData,
  } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const cartSignatureRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const cartItems: CartItem[] = Object.entries(itemQuantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const product = cartProducts.find((item) => item.id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter((item): item is CartItem => Boolean(item));

  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const isCustomerNameInvalid =
    hasAttemptedSubmit && customerName.trim().length < 2;
  const isPhoneNumberInvalid =
    hasAttemptedSubmit &&
    phoneDigits.length !== 10 &&
    phoneDigits.length !== 11;
  const totalValue = cartItems.reduce(
    (total, item) => total + item.valor * item.quantity,
    0,
  );
  const cartSignature = cartItems
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join("|");

  useEffect(() => {
    if (errorMessage) feedbackRef.current?.focus();
  }, [errorMessage]);

  useEffect(() => {
    if (
      cartSignatureRef.current !== null &&
      cartSignatureRef.current !== cartSignature
    ) {
      // A different cart must receive a new key, so a previous retry cannot be reused.
      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
    }

    cartSignatureRef.current = cartSignature;
  }, [cartSignature]);

  const resetCheckoutAttempt = () => {
    sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) {
      resetCheckoutAttempt();
      setPhoneNumber(digits);
    } else if (digits.length <= 6) {
      resetCheckoutAttempt();
      setPhoneNumber(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else if (digits.length <= 10) {
      resetCheckoutAttempt();
      setPhoneNumber(
        `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`,
      );
    } else {
      resetCheckoutAttempt();
      setPhoneNumber(
        `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`,
      );
    }
  };

  const buildOrderSummary = (): PedidoResumoItem[] =>
    cartItems.map((item) => ({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      imagem: item.imagem,
      valor: item.valor,
      quantidade: item.quantity,
    }));

  const getIdempotencyKey = () => {
    const existingKey = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    if (existingKey) return existingKey;

    // Reusing this key on a retry lets the RPC return the original confirmation.
    const newKey = createIdempotencyKey();
    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, newKey);
    return newKey;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setHasAttemptedSubmit(true);
    if (
      customerName.trim().length < 2 ||
      ![10, 11].includes(phoneDigits.length)
    ) {
      setErrorMessage("Revise os campos destacados para continuar.");
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage(
        "Seu carrinho está vazio. Escolha ao menos um item para finalizar.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const confirmacao = await pedidosService.criarPedidoConfirmado({
        nome_cliente: customerName.trim(),
        telefone: phoneNumber,
        chave_idempotencia: getIdempotencyKey(),
        itens: cartItems.map((item) => ({
          produto_id: item.id,
          quantidade: item.quantity,
        })),
      });

      setLastOrderConfirmation({
        confirmacao_id: confirmacao.confirmacao_id,
        nome_cliente: customerName.trim(),
        senha_retirar_ped: confirmacao.codigo_retirada,
        expira_em: confirmacao.expira_em,
        total: confirmacao.total,
        produtos: buildOrderSummary(),
      });
      setConfirmationAccessData({
        confirmacaoId: confirmacao.confirmacao_id,
        codigoRetirada: confirmacao.codigo_retirada,
      });
      setItemQuantities({});
      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
      navigate(`/efetuacao/${confirmacao.confirmacao_id}`);
    } catch (error) {
      console.error("Erro ao enviar o pedido:", error);
      setErrorMessage("Não foi possível enviar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pedidos-page">
      <Container>
        <DefaultButton
          customizarCSS="voltarButton"
          onClick={() => navigate(-1)}
          type="button"
        >
          Voltar
        </DefaultButton>
        <header className="pedidos-page__header">
          <p>Finalização segura</p>
          <h1>Seu pedido está quase pronto</h1>
          <span>
            Confirme seus dados e retire no balcão quando receber o código.
          </span>
        </header>

        {cartItems.length === 0 ? (
          <section
            className="pedido-vazio"
            aria-labelledby="pedido-vazio-title"
          >
            <h2 id="pedido-vazio-title">Seu carrinho está vazio</h2>
            <p>
              Escolha algo especial no cardápio antes de finalizar o pedido.
            </p>
            <DefaultButton onClick={() => navigate("/")} type="button">
              Ver cardápio
            </DefaultButton>
          </section>
        ) : (
          <div className="pedido-layout">
            <section
              className="pedido-form"
              aria-labelledby="dados-pedido-title"
            >
              <h2 id="dados-pedido-title">Dados para retirada</h2>
              <p>
                Usaremos essas informações apenas para identificar seu pedido.
              </p>
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group controlId="formName">
                  <Form.Label>Nome completo</Form.Label>
                  <Form.Control
                    aria-describedby={
                      isCustomerNameInvalid ? "erro-nome" : undefined
                    }
                    autoComplete="name"
                    isInvalid={isCustomerNameInvalid}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      resetCheckoutAttempt();
                      setCustomerName(event.target.value);
                    }}
                    required
                    type="text"
                    value={customerName}
                  />
                  {isCustomerNameInvalid && (
                    <p className="field-error" id="erro-nome">
                      Informe seu nome completo.
                    </p>
                  )}
                </Form.Group>
                <Form.Group controlId="formPhone">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    aria-describedby={
                      isPhoneNumberInvalid ? "erro-telefone" : "ajuda-telefone"
                    }
                    autoComplete="tel"
                    inputMode="tel"
                    isInvalid={isPhoneNumberInvalid}
                    maxLength={15}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    required
                    type="tel"
                    value={phoneNumber}
                  />
                  {isPhoneNumberInvalid ? (
                    <p className="field-error" id="erro-telefone">
                      Informe um telefone com DDD.
                    </p>
                  ) : (
                    <p className="field-hint" id="ajuda-telefone">
                      Usaremos este número caso precisemos falar com você.
                    </p>
                  )}
                </Form.Group>
                {errorMessage && (
                  <div
                    className="pedido-feedback"
                    ref={feedbackRef}
                    role="alert"
                    tabIndex={-1}
                  >
                    {errorMessage}
                  </div>
                )}
                <DefaultButton
                  aria-busy={isSubmitting}
                  customizarCSS="pedido-submit"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Enviando pedido..." : "Finalizar pedido"}
                </DefaultButton>
              </Form>
            </section>

            <aside
              className="pedido-resumo"
              aria-labelledby="resumo-pedido-title"
            >
              <div className="pedido-resumo__heading">
                <p>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "itens"}
                </p>
                <h2 id="resumo-pedido-title">Resumo do pedido</h2>
              </div>
              <div className="pedido-resumo__items">
                {cartItems.map((item) => (
                  <article key={item.id} className="item">
                    <img src={item.imagem} alt="" />
                    <div className="info">
                      <h3>{item.nome}</h3>
                      <p>Quantidade: {item.quantity}</p>
                    </div>
                    <strong>
                      {formatCurrency(item.valor * item.quantity)}
                    </strong>
                  </article>
                ))}
              </div>
              <div className="total">
                <span>Total</span>
                <strong>{formatCurrency(totalValue)}</strong>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
};

export default Pedidos;
