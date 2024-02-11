import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Tabs, Tab, Table } from 'react-bootstrap';
import { FaCircle } from 'react-icons/fa';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [key, setKey] = useState('Em Andamento');

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
    }, []);

    const atualizarStatusPedido = (pedido) => {
        const now = new Date();
        const pedidoTime = new Date(pedido.data_hora);
        const hoursDiff = (now - pedidoTime) / 3600000; // Diferença em horas

        if (hoursDiff < 1) return 'Em Andamento';
        if (hoursDiff >= 1 && hoursDiff < 48) return 'Finalizado';
        return 'Concluído';
    };

    const renderPedidoItem = (pedido) => {
        const statusPedido = atualizarStatusPedido(pedido);

        return (
            <tr key={pedido.id}>
                <td>{pedido.nome_completo}</td>
                <td>{pedido.produtos.map(produto => `${produto.nome} (x${produto.quantidade})`).join(', ')}</td>
                <td>R$ {pedido.total.toFixed(2)}</td>
                <td>{statusPedido}</td> {/* Exibindo o status calculado */}
            </tr>
        );
    };

    const pedidosFiltrados = pedidos.filter(pedido => atualizarStatusPedido(pedido) === key);

    return (
        <div>
            <h2>Pedidos</h2>
            <Tabs activeKey={key} onSelect={(k) => setKey(k)}>
                <Tab eventKey="Em Andamento" title={<span><FaCircle color="yellow" /> Em Andamento</span>}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Produtos</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map(renderPedidoItem)}
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="Finalizado" title={<span><FaCircle color="red" /> Pronto para Entrega</span>}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Produtos</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map(renderPedidoItem)}
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="Concluído" title={<span><FaCircle color="green" /> Concluído</span>}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Produtos</th>
                                <th>Total</th>
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
