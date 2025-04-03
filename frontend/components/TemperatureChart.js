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
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TemperatureChart = () => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/temperature/?limit=20');
        if (response.data && response.data.length > 0) {
          setTemperatureData(response.data);
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

  // Dados padrão para quando não há dados
  const defaultData = {
    labels: ['--'],
    datasets: [{
      label: 'Temperatura (°C)',
      data: [0],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.1,
    }]
  };

  const data = temperatureData.length > 0 ? {
    labels: temperatureData.map(item => 
      item.created_at ? new Date(item.created_at).toLocaleTimeString() : '--'
    ),
    datasets: [{
      label: 'Temperatura (°C)',
      data: temperatureData.map(item => item.temperature || 0),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.1,
    }]
  } : defaultData;

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
      y: {
        min: temperatureData.length > 0 ? Math.min(...temperatureData.map(item => item.temperature)) - 2 : 0,
        max: temperatureData.length > 0 ? Math.max(...temperatureData.map(item => item.temperature)) + 2 : 30,
      },
    },
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Line options={options} data={data} />
    </div>
  );
};

export default TemperatureChart;