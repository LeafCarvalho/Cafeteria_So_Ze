import { FormEvent, useEffect, useRef, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/Context/CartContext";
import { pedidosService } from "@/services/pedidosService";
import { UltimoPedido } from "@/types/pedidos";
import { DefaultButton } from "@/Utils/Buttons/Buttons";
import "./style.scss";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Efetuacao = () => {
  const { confirmacaoId } = useParams<{ confirmacaoId: string }>();
  const {
    lastOrderConfirmation,
    setLastOrderConfirmation,
    confirmationAccessData,
    setConfirmationAccessData,
  } = useCart();
  const [orderConfirmation, setOrderConfirmation] = useState<UltimoPedido | null>(
    lastOrderConfirmation?.confirmacao_id === confirmacaoId ? lastOrderConfirmation : null,
  );
  const [pickupCode, setPickupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (errorMessage) feedbackRef.current?.focus();
  }, [errorMessage]);

  const recoverOrder = async (pickupCodeToValidate: string) => {
    if (!confirmacaoId) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const confirmation = await pedidosService.recuperarConfirmacao(confirmacaoId, pickupCodeToValidate);
      if (!confirmation) {
        setOrderConfirmation(null);
        setErrorMessage("Não encontramos um pedido com esses dados. Confira o código e tente novamente.");
        return;
      }
      setOrderConfirmation(confirmation);
      setLastOrderConfirmation(confirmation);
      setConfirmationAccessData({ confirmacaoId, codigoRetirada: pickupCodeToValidate });
    } catch (error) {
      console.error("Erro ao recuperar pedido:", error);
      setErrorMessage("Não foi possível consultar este pedido agora. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (confirmacaoId && confirmationAccessData?.confirmacaoId === confirmacaoId && !orderConfirmation) {
      void recoverOrder(confirmationAccessData.codigoRetirada);
    }
  }, [confirmacaoId, confirmationAccessData, orderConfirmation]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pickupCode.length !== 6) {
      setErrorMessage("Informe os 6 números do código de retirada.");
      return;
    }
    void recoverOrder(pickupCode);
  };

  if (!confirmacaoId) {
    return (
      <main className="efetuacao-container"><Container><section className="efetuacao-card efetuacao-card--center" role="alert">
        <h1>Confirmação indisponível</h1><p>Nenhuma confirmação de pedido foi informada.</p>
        <DefaultButton onClick={() => navigate("/")} type="button">Voltar ao cardápio</DefaultButton>
      </section></Container></main>
    );
  }

  if (!orderConfirmation) {
    return (
      <main className="efetuacao-container"><Container><section aria-labelledby="recuperar-title" className="efetuacao-card efetuacao-card--recovery">
        <p className="efetuacao-eyebrow">Consulta de pedido</p>
        <h1 id="recuperar-title">Recuperar pedido</h1>
        <p>Informe o código de retirada para consultar esta confirmação.</p>
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group controlId="codigoRetirada">
            <Form.Label>Código de retirada</Form.Label>
            <Form.Control aria-describedby="ajuda-codigo" autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setPickupCode(event.target.value.replace(/\D/g, "").slice(0, 6))} pattern="[0-9]{6}" required value={pickupCode} />
            <p className="field-hint" id="ajuda-codigo">São os 6 números enviados ao concluir o pedido.</p>
          </Form.Group>
          {errorMessage && <div className="efetuacao-feedback" ref={feedbackRef} role="alert" tabIndex={-1}>{errorMessage}</div>}
          <DefaultButton aria-busy={isLoading} disabled={isLoading} type="submit">{isLoading ? "Consultando..." : "Consultar pedido"}</DefaultButton>
        </Form>
      </section></Container></main>
    );
  }

  return (
    <main className="efetuacao-container"><Container><section aria-labelledby="confirmacao-title" className="efetuacao-card">
      <header className="efetuacao-card__header">
        <p className="efetuacao-eyebrow">Pedido confirmado</p>
        <h1 id="confirmacao-title">Tudo certo, {orderConfirmation.nome_cliente}.</h1>
        <p>Estimativa de preparo: 30 a 60 minutos.</p>
      </header>
      <div className="codigo-retirada" aria-label={`Código de retirada: ${orderConfirmation.senha_retirar_ped}`}><span>Seu código de retirada</span><strong>{orderConfirmation.senha_retirar_ped}</strong><small>Válido até {new Date(orderConfirmation.expira_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.</small></div>
      <div className="confirmacao-itens">
        <h2>Seu pedido</h2>
        {orderConfirmation.produtos.map((item) => <article key={item.id} className="pedido-item"><img src={item.imagem} alt="" /><div><h3>{item.nome}</h3><p>Quantidade: {item.quantidade}</p></div><strong>{formatCurrency(item.valor * item.quantidade)}</strong></article>)}
      </div>
      <div className="confirmacao-total"><span>Total</span><strong>{formatCurrency(orderConfirmation.total)}</strong></div>
      <DefaultButton customizarCSS="efetuacao-return" onClick={() => navigate("/")} type="button">Voltar ao cardápio</DefaultButton>
    </section></Container></main>
  );
};

export default Efetuacao;
