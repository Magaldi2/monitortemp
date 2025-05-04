'use client'

import { Container, Box, Button, Alert, CircularProgress } from '@mui/material'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import axios from 'axios'
import EmailRecipientsManager from '@/components/EmailRecipientsManager'
import PopupCard from './components/PopupCard'

const LatestTemperature = dynamic(
  () => import('@/components/LatestTemperature'),
  {
    ssr: false,
    loading: () => <Box sx={{ p: 2 }}>Carregando temperatura...</Box>,
  }
)

const TemperatureChart = dynamic(
  () => import('@/components/TemperatureChart'),
  {
    ssr: false,
    loading: () => <Box sx={{ p: 2 }}>Carregando gráfico...</Box>,
  }
)

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [popupOpen,setPopupOpen] = useState(false)

  const handleOpenPopup= () => setPopupOpen(true)
  const handleClosePopup= () => setPopupOpen(false)

  const handleClearReadings = async () => {
    if (!window.confirm('Tem certeza que deseja apagar TODAS as leituras?')) return

    setLoading(true)
    try {
      const res = await axios.delete('http://localhost:8000/api/temperature/clear')
      setGlobalSuccess(res.data.message || 'Leituras apagadas!')
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setGlobalError(err.response?.data?.detail || 'Erro ao limpar dados')
      } else {
        setGlobalError('Erro desconhecido')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', minHeight: '100vh' }}>
      <Button
        variant="contained"
        color="error"
        onClick={handleClearReadings}
        disabled={loading}
        sx={{ position: 'absolute', top: 16, right: 16, minWidth: 200 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Limpar Leituras'}
      </Button>

      {globalError && <Alert severity="error" sx={{ mb: 3 }}>{globalError}</Alert>}
      {globalSuccess && <Alert severity="success" sx={{ mb: 3 }}>{globalSuccess}</Alert>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenPopup}
        sx={{ position: 'absolute', top: 16, left: 16, minWidth: 300}}
      >
        Emails
      </Button>
      <PopupCard open={popupOpen} onClose={handleClosePopup} >
        <EmailRecipientsManager />
      </PopupCard>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 6 }}>
        <LatestTemperature key={`temp-${refreshKey}`} />
        <TemperatureChart key={`chart-${refreshKey}`} />
      </Box>
    </Container>
  )
}
