// src/app/page.tsx
'use client'

import { Container, Box, Button, Alert, CircularProgress } from '@mui/material'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import axios from 'axios'

const LatestTemperature = dynamic(
  () => import('./components/LatestTemperature'),
  { 
    ssr: false,
    loading: () => <Box sx={{ p: 2, textAlign: 'center' }}>Carregando temperatura...</Box>
  }
)

const TemperatureChart = dynamic(
  () => import('./components/TemperatureChart'),
  { 
    ssr: false,
    loading: () => <Box sx={{ p: 2, textAlign: 'center' }}>Carregando gráfico...</Box>
  }
)

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleClearReadings = async () => {
    if (!window.confirm('Tem certeza que deseja apagar TODAS as leituras de temperatura?')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await axios.delete('http://localhost:8000/api/temperature/clear')
      setSuccess(response.data.message || 'Leituras apagadas com sucesso!')
      // Atualiza a chave para forçar recarregamento dos componentes
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 8,  // Aumentado para acomodar o botão flutuante
      mb: 4,
      position: 'relative'  // Permite posicionamento absoluto do botão
    }}>
      {/* Botão flutuante de limpar leituras */}
      <Button
        variant="contained"
        color="error"
        onClick={handleClearReadings}
        disabled={loading}
        sx={{
          position: 'absolute',
          top: -60,  // Posiciona acima do conteúdo
          right: 0,
          minWidth: '200px',
          fontWeight: 'bold',
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
            backgroundColor: 'error.dark'
          }
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }}/>
            Limpando...
          </>
        ) : (
          'Limpar Todas as Leituras'
        )}
      </Button>

      {/* Mensagens de feedback */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Conteúdo principal com chave de atualização */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3,
        mt: 2  // Espaço extra para o botão flutuante
      }}>
        <LatestTemperature key={`latest-${refreshKey}`} />
        <TemperatureChart key={`chart-${refreshKey}`} />
      </Box>
    </Container>
  )
}