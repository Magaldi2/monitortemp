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
  FontSpec,
} from 'chart.js'
import annotationPlugin, {
  AnnotationOptions,
} from 'chartjs-plugin-annotation'
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
  TimeScale,
  annotationPlugin
)

interface Temperature {
  temperature: number
  created_at: string
}

interface Props {
  deviceId: string
}

// 1) Tipo para options com annotation
type LineWithAnnotationOptions = ChartOptions<'line'> & {
  plugins?: {
    annotation?: Partial<AnnotationOptions>
  }
}

const TemperatureChart = ({ deviceId }: Props) => {
  const [dataPoints, setDataPoints] = useState<Temperature[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<Temperature[]>(
          `http://localhost:8000/api/${deviceId}/temperature/`,
          { params: { limit: 20 } }
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

  const options: LineWithAnnotationOptions = {
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
        font: { size: 18, weight: 'bold' } as FontSpec,
      },
      annotation: {
        annotations: {
          coldChainRange: {
            type: 'box',
            yMin: 2,
            yMax: 8,
            backgroundColor: 'rgba(0, 200, 0, 0.1)',
            borderColor: 'rgba(0, 200, 0, 0.5)',
            borderWidth: 1,
          },
        },
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
        title: { display: true, text: 'Horário' },
        grid: { color: 'rgba(200, 200, 200, 0.5)' },
      },
      y: {
        title: { display: true, text: 'Temperatura (°C)' },
        min: 0,
        max: 10,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(200, 200, 200, 0.5)' },
      },
    },
  }

  const chartData = {
    labels: dataPoints.map((p) => p.created_at),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: dataPoints.map((p) => ({ x: p.created_at, y: p.temperature })),
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
