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
import { pedidosService } from "@/services/pedidosService";
import { PedidosCount } from "@/types/pedidos";
import "./style.scss";

interface ChartDataFormat {
  Periodo: string;
  Quantidade: number;
}

const exportToExcel = (chartData: ChartData<"bar">) => {
  if (!chartData.labels) return;

  const dataForExcel: ChartDataFormat[] = chartData.labels.map((label, index) => ({
    Periodo: String(label),
    Quantidade: Number(chartData.datasets[0].data[index]),
  }));
  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
  saveAs(data, "Relatorio_Cafeteria_So_Ze.xlsx");
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Inicio: React.FC = () => {
  const [pedidosCount, setPedidosCount] = useState<PedidosCount>({ diario: 0, semanal: 0, mensal: 0, anual: 0 });
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
        setErro("Não foi possível carregar o resumo dos pedidos.");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const data: ChartData<"bar"> = {
    labels: ["Diário", "Semanal", "Mensal", "Anual"],
    datasets: [{
      label: "Quantidade de pedidos",
      data: [pedidosCount.diario, pedidosCount.semanal, pedidosCount.mensal, pedidosCount.anual],
      backgroundColor: "#7adbd1",
      borderColor: "#a1e8e0",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: "#f6f1e8" }, grid: { color: "#31403b" } },
      y: { beginAtZero: true, ticks: { color: "#f6f1e8", precision: 0 }, grid: { color: "#31403b" } },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Pedidos por período", color: "#f6f1e8", font: { size: 16 } },
      tooltip: { displayColors: false },
    },
  };

  return (
    <section className="admin-panel" aria-labelledby="resumo-pedidos-title">
      <header className="admin-panel__header">
        <p>Visão geral</p>
        <h1 id="resumo-pedidos-title">Resumo dos pedidos</h1>
      </header>
      {loading && <p className="admin-feedback" role="status">Carregando resumo dos pedidos...</p>}
      {erro && <p className="admin-feedback admin-feedback--error" role="alert">{erro}</p>}
      {!loading && !erro && <>
        <div className="cards-container" aria-label="Totais de pedidos por período">
          {Object.entries(pedidosCount).map(([periodo, quantidade]) => (
            <Card key={periodo} className="summary-card">
              <Card.Body>
                <Card.Title>{periodo.charAt(0).toUpperCase() + periodo.slice(1)}</Card.Title>
                <Card.Text>{quantidade} <span>{quantidade === 1 ? "pedido" : "pedidos"}</span></Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
        <section className="chart-container" aria-labelledby="grafico-pedidos-title">
          <div className="chart-container__heading">
            <h2 id="grafico-pedidos-title">Pedidos por período</h2>
            <button type="button" onClick={() => exportToExcel(data)}>Exportar relatório</button>
          </div>
          <div className="chart-canvas"><Bar data={data} options={options} /></div>
        </section>
      </>}
    </section>
  );
};

export default Inicio;
