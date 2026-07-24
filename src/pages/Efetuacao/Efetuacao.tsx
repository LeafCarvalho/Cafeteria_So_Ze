import { FormEvent, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { pedidosService } from "../../services/pedidosService";
import { UltimoPedido } from "../../types/pedidos";
import "./style.scss";

const Efetuacao = () => {
  const { confirmacaoId } = useParams<{ confirmacaoId: string }>();
  const {
    lastOrder,
    setLastOrder,
    dadosAcessoConfirmacao,
    setDadosAcessoConfirmacao,
  } = useCart();
  const [pedido, setPedido] = useState<UltimoPedido | null>(
    lastOrder?.confirmacao_id === confirmacaoId ? lastOrder : null,
  );
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const recuperarPedido = async (codigoRetirada: string) => {
    if (!confirmacaoId) return;

    setCarregando(true);
    setErro(null);

    try {
      const confirmacao = await pedidosService.recuperarConfirmacao(
        confirmacaoId,
        codigoRetirada,
      );

      if (!confirmacao) {
        setPedido(null);
        setErro("Não foi possível recuperar este pedido.");
        return;
      }

      setPedido(confirmacao);
      setLastOrder(confirmacao);
      setDadosAcessoConfirmacao({ confirmacaoId, codigoRetirada });
    } catch (error) {
      console.error("Erro ao recuperar pedido:", error);
      setErro("Não foi possível recuperar este pedido. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (
      confirmacaoId &&
      dadosAcessoConfirmacao?.confirmacaoId === confirmacaoId &&
      !pedido
    ) {
      void recuperarPedido(dadosAcessoConfirmacao.codigoRetirada);
    }
  }, [confirmacaoId, dadosAcessoConfirmacao, pedido]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void recuperarPedido(codigo);
  };

  if (!confirmacaoId) {
    return (
      <div className="efetuacao-container">
        <p>Nenhuma confirmação de pedido foi informada.</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="efetuacao-container">
        <div className="container">
          <h1>Recuperar pedido</h1>
          <p>Informe o código de retirada para consultar esta confirmação.</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="codigoRetirada">
              <Form.Label>Código de retirada</Form.Label>
              <Form.Control
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ""))}
                pattern="[0-9]{6}"
                required
                value={codigo}
              />
            </Form.Group>
            {erro && <p className="mt-3 text-danger">{erro}</p>}
            <Button className="mt-3" disabled={carregando} type="submit">
              {carregando ? "Consultando..." : "Consultar pedido"}
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="efetuacao-container">
      <div className="container">
        <div className="d-flex flex-column justify-content-center align-items-center">
          <h1>Bom demais, {pedido.nome_cliente}! Seu pedido foi efetuado com sucesso.</h1>
        </div>
        <p>Estimativa de preparo: 30 a 60 minutos.</p>
        <p>Apresente este código no balcão para retirar seu pedido:</p>
        <h3>{pedido.senha_retirar_ped}</h3>
        <p>
          Código válido até {new Date(pedido.expira_em).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}.
        </p>
        {pedido.produtos.map((item) => (
          <div key={item.id} className="pedido-item">
            <img src={item.imagem} alt={item.nome} />
            <div>
              <p>Nome: {item.nome}</p>
              <p>Quantidade: {item.quantidade}</p>
              <p>
                Valor unitário: {item.valor.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        ))}
        <p>
          Total: {pedido.total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>
    </div>
  );
};

export default Efetuacao;
