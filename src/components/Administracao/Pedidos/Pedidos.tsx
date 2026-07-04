import { Table } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";
import { usePedidos } from "../../../hooks/usePedidos";
import { Pedido, PedidoStatus } from "../../../types/pedidos";
import "./style.scss";

const statusLabels: Record<PedidoStatus, string> = {
  criado: "Recebido",
  em_preparo: "Em preparo",
  pronto: "Pronto para retirada",
  finalizado: "Retirado",
  cancelado: "Cancelado",
};

const statusColors: Record<PedidoStatus, string> = {
  criado: "#f4c542",
  em_preparo: "#3182ce",
  pronto: "#38a169",
  finalizado: "#718096",
  cancelado: "#e53e3e",
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
  const { pedidos, loading, erro, atualizarPedido, carregarPedidos } = usePedidos();

  const renderPedidoItem = (pedido: Pedido) => (
    <tr key={pedido.id}>
      <td>{pedido.nome_cliente}</td>
      <td>{pedido.telefone}</td>
      <td>{pedido.senha_retirar_ped}</td>
      <td>{pedido.produto?.nome ?? pedido.produto_id}</td>
      <td>{formatarMoeda(pedido.total)}</td>
      <td>{formatarData(pedido.created_at)}</td>
      <td>
        <select
          value={pedido.status}
          onChange={(event) =>
            atualizarPedido(pedido.id, {
              status: event.target.value as PedidoStatus,
            })
          }
        >
          {Object.entries(statusLabels).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );

  return (
    <div className="pedidos-container">
      <h2>Pedidos</h2>
      <div className="legenda-status">
        <p>Status dos pedidos:</p>
        <ul>
          {Object.entries(statusLabels).map(([status, label]) => (
            <li key={status}>
              <FaCircle style={{ color: statusColors[status as PedidoStatus] }} />{" "}
              {label}
            </li>
          ))}
        </ul>
      </div>

      {loading && <p>Carregando pedidos...</p>}
      {erro && (
        <p>
          {erro}. <button onClick={carregarPedidos}>Tentar novamente</button>
        </p>
      )}
      {!loading && !erro && pedidos.length === 0 && (
        <p>Nenhum pedido encontrado.</p>
      )}
      {!loading && !erro && pedidos.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Código</th>
              <th>Produto</th>
              <th>Total</th>
              <th>Data e Hora</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>{pedidos.map(renderPedidoItem)}</tbody>
        </Table>
      )}
    </div>
  );
};

export default Pedidos;

