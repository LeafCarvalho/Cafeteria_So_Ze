import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
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

interface Pedido {
  data_hora: Date | null;
}

interface PedidosCount {
  diario: number;
  semanal: number;
  mensal: number;
  anual: number;
}

interface ChartDataFormat {
  Periodo: string;
  Quantidade: number;
}

const exportToExcel = (chartData: ChartData<'bar'>) => {
  if (!chartData.labels) {
    return;
  }
  
  const dataForExcel: ChartDataFormat[] = chartData.labels.map((label: unknown, index: number) => ({
    Periodo: label as string,
    Quantidade: chartData.datasets[0].data[index] as number,
  }));
   

  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

  saveAs(data, 'Relatorio_Cafeteria_So_Ze.xlsx');
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Inicio: React.FC = () => {
  const [pedidosCount, setPedidosCount] = useState<PedidosCount>({
    diario: 0,
    semanal: 0,
    mensal: 0,
    anual: 0,
  });

  useEffect(() => {
    const fetchPedidos = async () => {
      const pedidosSnapshot = await getDocs(query(collection(db, "pedidos")));
      const pedidos = pedidosSnapshot.docs.map(doc => ({
        ...doc.data(),
        data_hora: doc.data().data_hora?.toDate(),
      }) as Pedido);

      const count: PedidosCount = { diario: 0, semanal: 0, mensal: 0, anual: 0 };
      const hoje = new Date();
      const inicioDoAno = new Date(hoje.getFullYear(), 0, 1);
      const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioDaSemana = new Date(new Date().setDate(hoje.getDate() - hoje.getDay()));
      const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

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

  const data: ChartData<'bar'> = {
    labels: ['Diário', 'Semanal', 'Mensal', 'Anual'],
    datasets: [
      {
        label: 'Quantidade de Pedidos',
        data: [pedidosCount.diario, pedidosCount.semanal, pedidosCount.mensal, pedidosCount.anual],
        backgroundColor: ['blue', 'orange', 'green', 'red'],
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Pedidos por Período',
      },
    },
  };

  return (
    <div className="admin-panel">
      <h2 className="resumo-pedidos-header">Resumo dos Pedidos</h2>
      <div className="cards-container">
        {Object.entries(pedidosCount).map(([periodo, quantidade]) => (
          <Card key={periodo}>
            <Card.Body>
              <Card.Title>{periodo.charAt(0).toUpperCase() + periodo.slice(1)}</Card.Title>
              <Card.Text>{quantidade}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="chart-container">
        <button onClick={() => exportToExcel(data)}>Exportar para Excel</button>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Inicio;
