import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import { Tabs, Tab, Table } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";
import "./style.scss";

interface Produto {
  nome: string;
  quantidade: number;
}

interface Pedido {
  id: string;
  nome_completo: string;
  produtos: Produto[];
  total: number;
  data_hora: Date | null;
}

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [key, setKey] = useState<string>("Em Andamento");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const fetchPedidos = async () => {
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const fetchedPedidos: Pedido[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        data_hora: doc.data().data_hora ? doc.data().data_hora.toDate() : null,
      }) as Pedido);
      setPedidos(fetchedPedidos);
    };

    fetchPedidos();

    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/Sao_Paulo",
      }).format(now);

      setCurrentTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const atualizarStatusPedido = (pedido: Pedido): string => {
    const now = new Date();
    const pedidoTime = pedido.data_hora ? new Date(pedido.data_hora) : null;
    const hoursDiff = pedidoTime ? (now.getTime() - pedidoTime.getTime()) / 3600000 : 0;

    if (hoursDiff < 1) return "Em Andamento";
    if (hoursDiff >= 1 && hoursDiff < 48) return "Finalizado";
    return "Concluído";
  };

  const renderPedidoItem = (pedido: Pedido) => {
    const statusPedido = atualizarStatusPedido(pedido);
    const dataHoraFormatada = pedido.data_hora
      ? new Intl.DateTimeFormat("pt-BR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(pedido.data_hora)
      : "Indisponível";

    return (
      <tr key={pedido.id}>
        <td>{pedido.nome_completo}</td>
        <td>
          <ul>
            {pedido.produtos.map((produto, index) => (
              <li key={index}>{`${produto.nome} (x${produto.quantidade})`}</li>
            ))}
          </ul>
        </td>
        <td>R$ {pedido.total.toFixed(2)}</td>
        <td>{dataHoraFormatada}</td>
        <td>{statusPedido}</td>
      </tr>
    );
  };

  const pedidosFiltrados = pedidos.filter(
    (pedido) => atualizarStatusPedido(pedido) === key
  );

  return (
    <div className="pedidos-container">
      <div className="hora-atual">{currentTime}</div>
      <h2>Pedidos</h2>
      <div className="legenda-status">
        <p>Entenda os status dos pedidos:</p>
        <ul>
          <li>
            <FaCircle className="em-andamento" style={{ color: "yellow" }} /> Em Andamento: até 2 horas após o pedido.
          </li>
          <li>
            <FaCircle className="finalizado" style={{ color: "red" }} /> Pronto para Entrega: de 2 a 48 horas após o pedido.
          </li>
          <li>
            <FaCircle className="concluido" style={{ color: "green" }} /> Concluído: após 48 horas do pedido.
          </li>
        </ul>
      </div>
      <Tabs activeKey={key} onSelect={(k) => setKey(k as string)} className="nav">
        <Tab eventKey="Em Andamento" title={<span><FaCircle className="em-andamento" color="yellow" /> Em Andamento</span>} className="tab-content">
          <Table striped bordered hover>
            <thead>
              <tr className="em-andamento">
                <th>Cliente</th>
                <th>Produtos</th>
                <th>Total</th>
                <th>Data e Hora</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{pedidosFiltrados.map(renderPedidoItem)}</tbody>
          </Table>
        </Tab>
        <Tab eventKey="Finalizado" title={<span><FaCircle color="red" className="finalizado" /> Pronto para Entrega</span>}>
          <Table striped bordered hover>
            <thead>
              <tr className="finalizado">
                <th>Cliente</th>
                <th>Produtos</th>
                <th>Total</th>
                <th>Data e Hora</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{pedidosFiltrados.map(renderPedidoItem)}</tbody>
          </Table>
        </Tab>
        <Tab eventKey="Concluído" title={<span><FaCircle color="green" className="concluido" /> Concluído</span>}>
          <Table striped bordered hover>
            <thead>
              <tr className="concluido">
                <th>Cliente</th>
                <th>Produtos</th>
                <th>Total</th>
                <th>Data e Hora</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{pedidosFiltrados.map(renderPedidoItem)}</tbody>
          </Table>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Pedidos;
