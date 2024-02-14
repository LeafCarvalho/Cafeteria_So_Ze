import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Tabs, Tab, Table } from 'react-bootstrap';
import { FaCircle } from 'react-icons/fa';
import './style.scss';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [key, setKey] = useState('Em Andamento');
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const fetchPedidos = async () => {
            const querySnapshot = await getDocs(collection(db, "pedidos"));
            const fetchedPedidos = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                data_hora: doc.data().data_hora ? doc.data().data_hora.toDate() : null,
            }));
            setPedidos(fetchedPedidos);
        };

        fetchPedidos();

        const interval = setInterval(() => {
            const now = new Date();
            const formattedTime = new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'America/Sao_Paulo'
            }).format(now);

            setCurrentTime(formattedTime);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const atualizarStatusPedido = (pedido) => {
        const now = new Date();
        const pedidoTime = new Date(pedido.data_hora);
        const hoursDiff = (now - pedidoTime) / 3600000;

        if (hoursDiff < 1) return 'Em Andamento';
        if (hoursDiff >= 1 && hoursDiff < 48) return 'Finalizado';
        return 'Concluído';
    };

    const renderPedidoItem = (pedido) => {
        const statusPedido = atualizarStatusPedido(pedido);
        const dataHoraFormatada = pedido.data_hora ? new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(pedido.data_hora) : 'Indisponível';

        return (
            <tr key={pedido.id}>
                <td>{pedido.nome_completo}</td>
                <td>{pedido.produtos.map(produto => `${produto.nome} (x${produto.quantidade})`).join(', ')}</td>
                <td>R$ {pedido.total.toFixed(2)}</td>
                <td>{dataHoraFormatada}</td>
                <td>{statusPedido}</td>
            </tr>
        );
    };

    const pedidosFiltrados = pedidos.filter(pedido => atualizarStatusPedido(pedido) === key);

    return (
        <div className="pedidos-container">
            <div style={{ textAlign: 'right', marginRight: '20px' }}>{currentTime}</div>
            <h2>Pedidos</h2>
            <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="nav">
                <Tab eventKey="Em Andamento" title={<span><FaCircle className="em-andamento" /> Em Andamento</span>} className="tab-content">
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
                        <tbody>
                            {pedidosFiltrados.map(renderPedidoItem)}
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="Finalizado" title={<span><FaCircle color="red" className="finalizado"/> Pronto para Entrega</span>}>
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
                        <tbody>
                            {pedidosFiltrados.map(renderPedidoItem)}
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="Concluído" title={<span><FaCircle color="green" className="concluido"/> Concluído</span>}>
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
                        <tbody>
                            {pedidosFiltrados.map(renderPedidoItem)}
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>
        </div>
    );
};

export default Pedidos;
