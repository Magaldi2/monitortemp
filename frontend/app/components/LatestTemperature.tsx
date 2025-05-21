'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, CircularProgress } from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'

interface Temperature {
  temperature: number
  created_at: string
}

interface Props {
  deviceId: string
}

const LatestTemperature = ({ deviceId }: Props) => {
  const [latestTemp, setLatestTemp] = useState<Temperature | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestTemp = async () => {
      setLoading(true)
      try {
        const res = await axios.get<Temperature>(
          `http://localhost:8000/api/${deviceId}/temperature/latest/`
        )
        if (res.data) {
          setLatestTemp(res.data)
          setError(null)
        } else {
          setError('Nenhum dado encontrado')
        }
      } catch (err) {
        console.error('Error fetching latest temperature:', err)
        setError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchLatestTemp()
    const interval = setInterval(fetchLatestTemp, 2000)
    return () => clearInterval(interval)
  }, [deviceId])

  return (
    <Card sx={{
      minWidth: 275,
      marginBottom: 2,
      border: '1px solid #ddd',
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold'
          }}
        >
          <ThermostatIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
          Temperatura Atual
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : latestTemp ? (
          <>
            <Typography
              variant="h3"
              component="div"
              sx={{ textAlign: 'center', my: 2 }}
            >
              {latestTemp.temperature.toFixed(1)}°C
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              Atualizado: {new Date(latestTemp.created_at).toLocaleString('pt-BR')}
            </Typography>
          </>
        ) : (
          <Typography color="error">
            Não foi possível obter a temperatura
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default LatestTemperature
