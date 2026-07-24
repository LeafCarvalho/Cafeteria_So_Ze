import React, { ChangeEvent, FormEvent, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { pedidosService } from "../../services/pedidosService";
import { PedidoResumoItem } from "../../types/pedidos";
import { Produto } from "../../types/produtos";
import { DefaultButton } from "../../Utils/Buttons/Buttons";
import "./style.scss";

interface CartItem extends Produto {
  quantity: number;
}

const Pedidos: React.FC = () => {
  const {
    quantities,
    products,
    setQuantities,
    setLastOrder,
    setDadosAcessoConfirmacao,
  } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const cartItems: CartItem[] = Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const product = products.find((item) => item.id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter((item): item is CartItem => Boolean(item));

  const totalValue = cartItems.reduce(
    (total, item) => total + item.valor * item.quantity,
    0,
  );

  const formattedTotalValue = totalValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, "");
    let formattedValue = "";

    if (value.length > 2) {
      formattedValue += `(${value.substring(0, 2)}) `;
      value = value.substring(2);
    }

    if (value.length > 5) {
      formattedValue += `${value.substring(0, 5)}-${value.substring(5, 9)}`;
    } else {
      formattedValue += value;
    }

    setPhone(formattedValue);
  };

  const buildResumoProdutos = (): PedidoResumoItem[] =>
    cartItems.map((item) => ({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      imagem: item.imagem,
      valor: item.valor,
      quantidade: item.quantity,
    }));

  const buildItensPedido = () =>
    cartItems.map((item) => ({
      produto_id: item.id,
      quantidade: item.quantity,
    }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (enviando) return;

    if (!phone || cartItems.length === 0) {
      setErro("Informe um telefone válido e adicione pelo menos um produto.");
      return;
    }

    try {
      setEnviando(true);
      setErro(null);

      const confirmacao = await pedidosService.criarPedidoConfirmado({
        nome_cliente: name,
        telefone: phone,
        itens: buildItensPedido(),
      });

      setLastOrder({
        confirmacao_id: confirmacao.confirmacao_id,
        nome_cliente: name,
        senha_retirar_ped: confirmacao.codigo_retirada,
        expira_em: confirmacao.expira_em,
        total: confirmacao.total,
        produtos: buildResumoProdutos(),
      });
      setDadosAcessoConfirmacao({
        confirmacaoId: confirmacao.confirmacao_id,
        codigoRetirada: confirmacao.codigo_retirada,
      });
      setQuantities({});
      navigate(`/efetuacao/${confirmacao.confirmacao_id}`);
    } catch (error) {
      console.error("Erro ao enviar o pedido:", error);
      setErro("Erro ao enviar o pedido. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Container className="pedidos-page">
      <Row>
        <Col>
          <DefaultButton customizarCSS="voltarButton" onClick={() => navigate(-1)}>
            Voltar
          </DefaultButton>
          <div className="pedido-form">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label>Nome completo</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setName(event.target.value)
                  }
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPhone">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(XX) XXXXX-XXXX"
                  required
                />
              </Form.Group>
              {erro && <p className="mt-3 text-danger">{erro}</p>}
              <Button style={{ marginTop: "1.5rem" }} type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Finalizar Pedido"}
              </Button>
            </Form>
          </div>
        </Col>
        <Col>
          <div className="pedido-resumo">
            <h2>Seu Pedido</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="item">
                <img src={item.imagem} alt={item.nome} />
                <div className="info">
                  <h3>{item.nome}</h3>
                  <p>Quantidade: {item.quantity}</p>
                  <p>
                    Preço:{" "}
                    {item.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div className="total">Valor Total: {formattedTotalValue}</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Pedidos;
