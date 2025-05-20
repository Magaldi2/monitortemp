import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import axios from "axios";

// Registre os componentes necessários incluindo TimeScale
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Adicionado para suporte a escalas de tempo
);

const TemperatureChart = () => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/{device_id}/temperature/?limit=20"
        );
        if (response.data && response.data.length > 0) {
          const sortedData = [...response.data].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          setTemperatureData(sortedData);
          setError(null);
        } else {
          setError("Nenhum dado disponível");
          setTemperatureData([]);
        }
      } catch (err) {
        console.error("Error fetching temperature data:", err);
        setError("Erro ao carregar dados");
        setTemperatureData([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333", // Texto em cinza escuro
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Histórico de Temperatura",
        color: "#333",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      annotation: {
        annotations: {
          coldChainRange: {
            type: "box",
            yMin: 2,
            yMax: 8,
            backgroundColor: "rgba(0, 200, 0, 0.1)", // Verde claro
            borderColor: "rgba(0, 200, 0, 0.5)",
            borderWidth: 1,
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: {
            minute: "HH:mm",
          },
          tooltipFormat: "HH:mm:ss",
        },
        title: {
          display: true,
          text: "Horário",
          color: "#333",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "rgba(200, 200, 200, 0.5)", // Linhas de grade suaves
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperatura (°C)",
          color: "#333",
          font: {
            size: 14,
          },
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
          color: "#333",
        },
        grid: {
          color: "rgba(200, 200, 200, 0.5)", // Linhas de grade suaves
        },
      },
    },
  };

  const data = {
    labels: temperatureData.map((item) => item.created_at),
    datasets: [
      {
        label: "Temperatura (°C)",
        data: temperatureData.map((item) => ({
          x: item.created_at,
          y: item.temperature,
        })),
        borderColor: "rgba(0, 123, 255, 0.9)", // Azul para a linha
        backgroundColor: "rgba(0, 123, 255, 0.2)", // Azul claro para preenchimento
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  return (
    <div
      style={{
        backgroundColor: "#fff", // Fundo cinza claro
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #ddd",
      }}
    >
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}
      <Line data={data} options={options} />
    </div>
  );
};

export default TemperatureChart;
