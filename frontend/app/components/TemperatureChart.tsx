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
import { Typography, Box, CircularProgress } from '@mui/material'

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
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await axios.get<Temperature[]>(
          `http://localhost:8000/api/${deviceId}/temperature/`, // <-- Trocar o IP aqui
          { params: { limit: 100 } }
        )
        if (!ignore) {
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
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching temperature data:', err)
          setError('Erro ao carregar dados')
          setDataPoints([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [deviceId])

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
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
        grid: { color: 'rgba(200, 200, 200, 0.5)' },
      },
      y: {
        title: {
          display: true,
          text: 'Temperatura (°C)',
          color: '#333',
          font: { size: 14 },
        },
        suggestedMin: 10,
        suggestedMax: 30,
        beginAtZero: false,
        ticks: {
          color: '#333',
        },
        grid: { color: 'rgba(200, 200, 200, 0.5)' },
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
        borderColor: 'rgba(0, 123, 255, 0.9)',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
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
        position: 'relative',
        minHeight: 350,
      }}
    >
      {loading && (
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
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