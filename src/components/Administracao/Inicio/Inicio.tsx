import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { pedidosService } from "../../../services/pedidosService";
import { PedidosCount } from "../../../types/pedidos";
import "./style.scss";

interface ChartDataFormat {
  Periodo: string;
  Quantidade: number;
}

const exportToExcel = (chartData: ChartData<"bar">) => {
  if (!chartData.labels) return;

  const dataForExcel: ChartDataFormat[] = chartData.labels.map(
    (label: unknown, index: number) => ({
      Periodo: label as string,
      Quantidade: chartData.datasets[0].data[index] as number,
    }),
  );

  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(data, "Relatorio_Cafeteria_So_Ze.xlsx");
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Inicio: React.FC = () => {
  const [pedidosCount, setPedidosCount] = useState<PedidosCount>({
    diario: 0,
    semanal: 0,
    mensal: 0,
    anual: 0,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setErro(null);

        const pedidos = await pedidosService.listarPedidos();
        setPedidosCount(pedidosService.calcularResumo(pedidos));
      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar resumo dos pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const data: ChartData<"bar"> = {
    labels: ["Diário", "Semanal", "Mensal", "Anual"],
    datasets: [
      {
        label: "Quantidade de Pedidos",
        data: [
          pedidosCount.diario,
          pedidosCount.semanal,
          pedidosCount.mensal,
          pedidosCount.anual,
        ],
        backgroundColor: ["blue", "orange", "green", "red"],
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
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
        text: "Pedidos por Período",
      },
    },
  };

  return (
    <div className="admin-panel">
      <h2 className="resumo-pedidos-header">Resumo dos Pedidos</h2>
      {loading && <p>Carregando resumo...</p>}
      {erro && <p>{erro}</p>}
      {!loading && !erro && (
        <>
          <div className="cards-container">
            {Object.entries(pedidosCount).map(([periodo, quantidade]) => (
              <Card key={periodo}>
                <Card.Body>
                  <Card.Title>
                    {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                  </Card.Title>
                  <Card.Text>{quantidade}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>

          <div className="chart-container">
            <button onClick={() => exportToExcel(data)}>Exportar para Excel</button>
            <Bar data={data} options={options} />
          </div>
        </>
      )}
    </div>
  );
};

export default Inicio;

