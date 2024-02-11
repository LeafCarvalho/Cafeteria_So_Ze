import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Card } from 'react-bootstrap';
import Plot from 'react-plotly.js';

const Inicio = () => {
  const [pedidosCount, setPedidosCount] = useState({
    diario: 0,
    semanal: 0,
    mensal: 0,
    anual: 0,
  });

  useEffect(() => {
    const fetchPedidos = async () => {
      const hoje = new Date();
      const inicioDoAno = new Date(hoje.getFullYear(), 0, 1);
      const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioDaSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
      const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  
      const pedidosSnapshot = await getDocs(query(collection(db, "pedidos")));
      const pedidos = pedidosSnapshot.docs.map(doc => ({
          ...doc.data(),
          data_hora: doc.data().data_hora?.toDate(),
      }));
  
      const count = { diario: 0, semanal: 0, mensal: 0, anual: 0 };
  
      pedidos.forEach(pedido => {
          const dataPedido = pedido.data_hora;
          if (dataPedido) {
              if (dataPedido >= inicioDoDia) count.diario++;
              if (dataPedido >= inicioDaSemana) count.semanal++;
              if (dataPedido >= inicioDoMes) count.mensal++;
              if (dataPedido >= inicioDoAno) count.anual++;
          }
      });
  
      setPedidosCount(count);
  };

    fetchPedidos();
  }, []);

  return (
    <div>
      <h2>Resumo dos Pedidos</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Card>
          <Card.Body>
            <Card.Title>Diário</Card.Title>
            <Card.Text>{pedidosCount.diario}</Card.Text>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <Card.Title>Semanal</Card.Title>
            <Card.Text>{pedidosCount.semanal}</Card.Text>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <Card.Title>Mensal</Card.Title>
            <Card.Text>{pedidosCount.mensal}</Card.Text>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <Card.Title>Anual</Card.Title>
            <Card.Text>{pedidosCount.anual}</Card.Text>
          </Card.Body>
        </Card>
      </div>

      <Plot
        data={[
          {
            x: ['Diário', 'Semanal', 'Mensal', 'Anual'],
            y: [pedidosCount.diario, pedidosCount.semanal, pedidosCount.mensal, pedidosCount.anual],
            type: 'bar',
            marker: {
              color: ['blue', 'orange', 'green', 'red'],
            },
          },
        ]}
        layout={{ width: 700, height: 400, title: 'Pedidos por Período' }}
      />
    </div>
  );
};

export default Inicio;
