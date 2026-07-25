import { useState } from "react";
import { Table } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";
import { usePedidos } from "@/hooks/usePedidos";
import { Pedido, PedidoStatus } from "@/types/pedidos";
import "./style.scss";

const statusLabels: Record<PedidoStatus, string> = {
  criado: "Recebido",
  em_preparo: "Em preparo",
  pronto: "Pronto para retirada",
  finalizado: "Retirado",
  cancelado: "Cancelado",
};

const proximosStatusPermitidos: Record<PedidoStatus, PedidoStatus[]> = {
  criado: ["em_preparo", "cancelado"],
  em_preparo: ["pronto", "cancelado"],
  pronto: ["finalizado"],
  finalizado: [],
  cancelado: [],
};

const formatarData = (data: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Pedidos = () => {
  const { pedidos, loading, erro, atualizarStatusPedido, carregarPedidos } = usePedidos();
  const [pedidoEmAtualizacao, setPedidoEmAtualizacao] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const atualizarStatus = async (pedido: Pedido, status: PedidoStatus) => {
    if (status === pedido.status) return;

    setPedidoEmAtualizacao(pedido.id);
    setFeedback(null);
    const resultado = await atualizarStatusPedido({
      pedido_id: pedido.id,
      status_atual: pedido.status,
      novo_status: status,
    });

    const mensagens = {
      atualizado: `Status do pedido de ${pedido.nome_cliente} atualizado para ${statusLabels[status]}.`,
      conflito: "Este pedido foi alterado por outra pessoa. A lista foi atualizada; revise o status antes de tentar novamente.",
      erro: `Não foi possível atualizar o status do pedido de ${pedido.nome_cliente}. A lista foi atualizada.`,
    };
    setFeedback(mensagens[resultado]);

    setPedidoEmAtualizacao(null);
  };

  const renderPedidoItem = (pedido: Pedido) => {
    const selectId = `status-pedido-${pedido.id}`;
    const atualizando = pedidoEmAtualizacao === pedido.id;
    const transicoes = proximosStatusPermitidos[pedido.status];

    return (
      <tr key={pedido.id}>
        <td data-label="Cliente">{pedido.nome_cliente}</td>
        <td data-label="Telefone">{pedido.telefone}</td>
        <td data-label="Código">{pedido.senha_retirar_ped}</td>
        <td data-label="Produto">{pedido.produto?.nome ?? pedido.produto_id}</td>
        <td data-label="Total">{formatarMoeda(pedido.total)}</td>
        <td data-label="Data e hora">{formatarData(pedido.created_at)}</td>
        <td data-label="Status">
          <label className="visually-hidden" htmlFor={selectId}>
            Status do pedido de {pedido.nome_cliente}
          </label>
          <select
            aria-describedby={atualizando ? "atualizacao-status" : undefined}
            disabled={atualizando || transicoes.length === 0}
            id={selectId}
            value={pedido.status}
            onChange={(event) =>
              void atualizarStatus(pedido, event.target.value as PedidoStatus)
            }
          >
            <option value={pedido.status}>{statusLabels[pedido.status]}</option>
            {transicoes.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </td>
      </tr>
    );
  };

  return (
    <section aria-labelledby="pedidos-titulo" className="pedidos-container">
      <div className="pedidos-container__heading">
        <p className="pedidos-container__eyebrow">Administração</p>
        <h2 id="pedidos-titulo">Pedidos</h2>
      </div>

      <div aria-label="Legenda de status dos pedidos" className="legenda-status">
        <p>Status dos pedidos</p>
        <ul>
          {Object.entries(statusLabels).map(([status, label]) => (
            <li key={status}>
              <FaCircle
                aria-hidden="true"
                className={`legenda-status__icon legenda-status__icon--${status}`}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <p aria-atomic="true" aria-live="polite" className="pedidos-feedback" id="atualizacao-status" role="status">
        {pedidoEmAtualizacao ? "Atualizando status do pedido..." : feedback}
      </p>

      {loading && <p className="pedidos-state" role="status">Carregando pedidos...</p>}
      {erro && !loading && (
        <div className="pedidos-state pedidos-state--error" role="alert">
          <p>{erro}.</p>
          <button onClick={() => void carregarPedidos()} type="button">Tentar novamente</button>
        </div>
      )}
      {!loading && !erro && pedidos.length === 0 && (
        <p className="pedidos-state">Nenhum pedido encontrado.</p>
      )}
      {!loading && !erro && pedidos.length > 0 && (
        <div className="pedidos-table-wrapper" tabIndex={0}>
          <Table className="pedidos-table" hover responsive={false}>
            <caption>Lista de pedidos recebidos</caption>
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Telefone</th>
                <th scope="col">Código</th>
                <th scope="col">Produto</th>
                <th scope="col">Total</th>
                <th scope="col">Data e hora</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>{pedidos.map(renderPedidoItem)}</tbody>
          </Table>
        </div>
      )}
    </section>
  );
};

export default Pedidos;
