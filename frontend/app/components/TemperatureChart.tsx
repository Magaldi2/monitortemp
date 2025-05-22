'use client'

import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
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
  ChartOptions,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import axios from 'axios'
import { Typography, Box } from '@mui/material'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface Temperature {
  temperature: number
  created_at: string
}

interface Props {
  deviceId: string
}


const TemperatureChart = ({ deviceId }: Props) => {
  const [dataPoints, setDataPoints] = useState<Temperature[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<Temperature[]>(
          `http://localhost:8000/api/${deviceId}/temperature/`,
          { params: { limit: 100 } }
        )
        if (res.data.length > 0) {
          const sorted = [...res.data].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
          setDataPoints(sorted)
          setError(null)
        } else {
          setError('Nenhum dado disponível')
          setDataPoints([])
        }
      } catch (err) {
        console.error('Error fetching temperature data:', err)
        setError('Erro ao carregar dados')
        setDataPoints([])
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [deviceId])

const options: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#333', // Texto em cinza escuro
        font: { size: 14 },
      },
    },
    title: {
      display: true,
      text: 'Histórico de Temperatura',
      color: '#333',
      font: { size: 18, weight: 'bold' },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'minute',
        displayFormats: { minute: 'HH:mm' },
        tooltipFormat: 'HH:mm:ss',
      },
      title: {
        display: true,
        text: 'Horário',
        color: '#333',
        font: { size: 14 },
      },
      grid: { color: 'rgba(200, 200, 200, 0.5)' }, // Linhas de grade suaves
    },
    y: {
      title: {
        display: true,
        text: 'Temperatura (°C)',
        color: '#333',
        font: { size: 14 },
      },
      min: 0,
      //max: 10,
      ticks: {
        stepSize: 1,
        color: '#333',
      },
      grid: { color: 'rgba(200, 200, 200, 0.5)' }, // Linhas de grade suaves
    },
  },
}

const chartData = {
  labels: dataPoints.map((item) => item.created_at),
  datasets: [
    {
      label: 'Temperatura (°C)',
      data: dataPoints.map((item) => ({
        x: item.created_at,
        y: item.temperature,
      })),
      borderColor: 'rgba(0, 123, 255, 0.9)', // Azul para a linha
      backgroundColor: 'rgba(0, 123, 255, 0.2)', // Azul claro para preenchimento
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
}

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        padding: 2,
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ddd',
      }}
    >
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Line data={chartData} options={options} />
    </Box>
  )
}

export default TemperatureChart