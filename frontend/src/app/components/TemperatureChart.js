import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import axios from 'axios';

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
        const response = await axios.get('http://localhost:8000/api/temperature/?limit=20');
        if (response.data && response.data.length > 0) {
          // Ordena os dados por data/hora
          const sortedData = [...response.data].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
          setTemperatureData(sortedData);
          setError(null);
        } else {
          setError('Nenhum dado disponível');
          setTemperatureData([]);
        }
      } catch (err) {
        console.error('Error fetching temperature data:', err);
        setError('Erro ao carregar dados');
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
        position: 'top',
      },
      title: {
        display: true,
        text: 'Histórico de Temperatura',
      },
    },
    scales: {
      x: {
        type: 'time', // Configura o eixo X como temporal
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          },
          tooltipFormat: 'HH:mm:ss'
        },
        title: {
          display: true,
          text: 'Horário'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperatura (°C)'
        },
        min: temperatureData.length > 0 ? Math.min(...temperatureData.map(item => item.temperature)) - 2 : 0,
        max: temperatureData.length > 0 ? Math.max(...temperatureData.map(item => item.temperature)) + 2 : 30,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    }
  };

  const data = {
    labels: temperatureData.map(item => item.created_at),
    datasets: [{
      label: 'Temperatura (°C)',
      data: temperatureData.map(item => ({
        x: item.created_at,
        y: item.temperature
      })),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <Line 
        data={data} 
        options={options} 
      />
    </div>
  );
};

export default TemperatureChart;