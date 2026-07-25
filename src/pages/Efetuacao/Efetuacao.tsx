import { FormEvent, useEffect, useRef, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { pedidosService } from "../../services/pedidosService";
import { UltimoPedido } from "../../types/pedidos";
import { DefaultButton } from "../../Utils/Buttons/Buttons";
import "./style.scss";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Efetuacao = () => {
  const { confirmacaoId } = useParams<{ confirmacaoId: string }>();
  const { lastOrder, setLastOrder, dadosAcessoConfirmacao, setDadosAcessoConfirmacao } = useCart();
  const [pedido, setPedido] = useState<UltimoPedido | null>(lastOrder?.confirmacao_id === confirmacaoId ? lastOrder : null);
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (erro) feedbackRef.current?.focus();
  }, [erro]);

  const recuperarPedido = async (codigoRetirada: string) => {
    if (!confirmacaoId) return;

    setCarregando(true);
    setErro(null);
    try {
      const confirmacao = await pedidosService.recuperarConfirmacao(confirmacaoId, codigoRetirada);
      if (!confirmacao) {
        setPedido(null);
        setErro("Não encontramos um pedido com esses dados. Confira o código e tente novamente.");
        return;
      }
      setPedido(confirmacao);
      setLastOrder(confirmacao);
      setDadosAcessoConfirmacao({ confirmacaoId, codigoRetirada });
    } catch (error) {
      console.error("Erro ao recuperar pedido:", error);
      setErro("Não foi possível consultar este pedido agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (confirmacaoId && dadosAcessoConfirmacao?.confirmacaoId === confirmacaoId && !pedido) {
      void recuperarPedido(dadosAcessoConfirmacao.codigoRetirada);
    }
  }, [confirmacaoId, dadosAcessoConfirmacao, pedido]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (codigo.length !== 6) {
      setErro("Informe os 6 números do código de retirada.");
      return;
    }
    void recuperarPedido(codigo);
  };

  if (!confirmacaoId) {
    return (
      <main className="efetuacao-container"><Container><section className="efetuacao-card efetuacao-card--center" role="alert">
        <h1>Confirmação indisponível</h1><p>Nenhuma confirmação de pedido foi informada.</p>
        <DefaultButton onClick={() => navigate("/")} type="button">Voltar ao cardápio</DefaultButton>
      </section></Container></main>
    );
  }

  if (!pedido) {
    return (
      <main className="efetuacao-container"><Container><section aria-labelledby="recuperar-title" className="efetuacao-card efetuacao-card--recovery">
        <p className="efetuacao-eyebrow">Consulta de pedido</p>
        <h1 id="recuperar-title">Recuperar pedido</h1>
        <p>Informe o código de retirada para consultar esta confirmação.</p>
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group controlId="codigoRetirada">
            <Form.Label>Código de retirada</Form.Label>
            <Form.Control aria-describedby="ajuda-codigo" autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setCodigo(event.target.value.replace(/\D/g, "").slice(0, 6))} pattern="[0-9]{6}" required value={codigo} />
            <p className="field-hint" id="ajuda-codigo">São os 6 números enviados ao concluir o pedido.</p>
          </Form.Group>
          {erro && <div className="efetuacao-feedback" ref={feedbackRef} role="alert" tabIndex={-1}>{erro}</div>}
          <DefaultButton aria-busy={carregando} disabled={carregando} type="submit">{carregando ? "Consultando..." : "Consultar pedido"}</DefaultButton>
        </Form>
      </section></Container></main>
    );
  }

  return (
    <main className="efetuacao-container"><Container><section aria-labelledby="confirmacao-title" className="efetuacao-card">
      <header className="efetuacao-card__header">
        <p className="efetuacao-eyebrow">Pedido confirmado</p>
        <h1 id="confirmacao-title">Tudo certo, {pedido.nome_cliente}.</h1>
        <p>Estimativa de preparo: 30 a 60 minutos.</p>
      </header>
      <div className="codigo-retirada" aria-label={`Código de retirada: ${pedido.senha_retirar_ped}`}><span>Seu código de retirada</span><strong>{pedido.senha_retirar_ped}</strong><small>Válido até {new Date(pedido.expira_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.</small></div>
      <div className="confirmacao-itens">
        <h2>Seu pedido</h2>
        {pedido.produtos.map((item) => <article key={item.id} className="pedido-item"><img src={item.imagem} alt="" /><div><h3>{item.nome}</h3><p>Quantidade: {item.quantidade}</p></div><strong>{formatCurrency(item.valor * item.quantidade)}</strong></article>)}
      </div>
      <div className="confirmacao-total"><span>Total</span><strong>{formatCurrency(pedido.total)}</strong></div>
      <DefaultButton customizarCSS="efetuacao-return" onClick={() => navigate("/")} type="button">Voltar ao cardápio</DefaultButton>
    </section></Container></main>
  );
};

export default Efetuacao;
