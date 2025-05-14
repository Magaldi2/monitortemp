'use client'

import React, { useState } from 'react'
import axios from 'axios'
import {
  Box,
  Container,
  Alert,
  CircularProgress,
  Fab,    
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import MainLayout from '@/components/MainLayout'
import PopupCard from '@/components/PopupCard'
import EmailRecipientsManager from '@/components/EmailRecipientsManager'
import dynamic from 'next/dynamic'
import DeleteIcon from '@mui/icons-material/Delete'

const LatestTemperature = dynamic(
  () => import('@/components/LatestTemperature'),
  { ssr: false, loading: () => <CircularProgress /> }
)
const TemperatureChart = dynamic(
  () => import('@/components/TemperatureChart'),
  { ssr: false, loading: () => <CircularProgress /> }
)

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [popupOpen, setPopupOpen] = useState(false)
  const [loadingClear, setLoadingClear] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null)

  const handleClearReadings = async () => {
    if (!confirm('Apagar TODAS as leituras?')) return
    setLoadingClear(true)
    try {
      const res = await axios.delete(
        'http://localhost:8000/api/temperature/clear'
      )
      setGlobalSuccess(res.data.message || 'Leituras apagadas!')
      setRefreshKey((p) => p + 1)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setGlobalError(err.response?.data?.detail || 'Erro ao limpar dados')
      } else {
        setGlobalError('Erro desconhecido')
      }
    } finally {
      setLoadingClear(false)
    }
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ mt: 4, position: 'relative' }}>
        {/* Mensagens globais */}
        {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {globalError}
          </Alert>
        )}
        {globalSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {globalSuccess}
          </Alert>
        )}

        {/* Última Temperatura */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <LatestTemperature key={refreshKey} />
        </Box>

        {/* Ações flutuantes */}
        <Fab
          color="primary"
          aria-label="Adicionar e-mail"
          onClick={() => setPopupOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1500,
          }}
        >
          <AddIcon />
        </Fab>

        <Fab
          color="error"
          aria-label="Limpar leituras"
          onClick={handleClearReadings}
          disabled={loadingClear}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            zIndex: 1500,
          }}
        >
          {loadingClear
            ? <CircularProgress size={20} color="inherit" />
            : <DeleteIcon />
          }
        </Fab>

        {/* Popup de E-mails */}
        <PopupCard open={popupOpen} onClose={() => setPopupOpen(false)}>
          <EmailRecipientsManager />
        </PopupCard>

        {/* Gráfico de Temperatura */}
        <Box sx={{ mt: 4 }}>
          <TemperatureChart key={`chart-${refreshKey}`} />
        </Box>
      </Container>
    </MainLayout>
  )
}
