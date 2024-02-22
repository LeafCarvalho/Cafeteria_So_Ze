import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import './style.scss';

function exportToExcel(chartData) {
  // Transformando os dados do gráfico para um formato que a função json_to_sheet possa entender
  const dataForExcel = chartData.labels.map((label, index) => ({
    Periodo: label,
    Quantidade: chartData.datasets[0].data[index]
  }));

  // Convertendo os dados para uma planilha
  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Escrevendo o livro em um blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

  // Iniciando o download do arquivo Excel
  saveAs(data, 'Relatorio_Cafeteria_So_Ze.xlsx');
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      const inicioDaSemana = new Date(new Date().setDate(hoje.getDate() - hoje.getDay()));
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

  const data = {
    labels: ['Diário', 'Semanal', 'Mensal', 'Anual'],
    datasets: [
      {
        label: 'Quantidade de Pedidos',
        data: [pedidosCount.diario, pedidosCount.semanal, pedidosCount.mensal, pedidosCount.anual],
        backgroundColor: ['blue', 'orange', 'green', 'red'],
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Pedidos por Período',
    },
  };

  return (
    <div className="admin-panel">
      <h2 className="resumo-pedidos-header">Resumo dos Pedidos</h2>
      <div className="cards-container">
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

      <div className="chart-container">
    <button onClick={() => exportToExcel(data)}>Exportar para Excel</button>
    <Bar data={data} options={options} />
</div>
    </div>
  );
};

export default Inicio;
