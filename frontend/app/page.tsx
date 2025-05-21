'use client'

import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import {
  Box,
  Container,
  Alert,
  CircularProgress,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import MainLayout from '@/components/MainLayout'
import PopupCard from '@/components/PopupCard'
import EmailRecipientsManager from '@/components/EmailRecipientsManager'
import dynamic from 'next/dynamic'

const LatestTemperature = dynamic(
  () => import('@/components/LatestTemperature'),
  { ssr: false, loading: () => <CircularProgress /> }
)
const TemperatureChart = dynamic(
  () => import('@/components/TemperatureChart'),
  { ssr: false, loading: () => <CircularProgress /> }
)

interface ClearResponse {
  message: string
}

export default function DashboardPage() {
  const [deviceList, setDeviceList] = useState<string[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [popupOpen, setPopupOpen] = useState(false)
  const [loadingClear, setLoadingClear] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null)

  // 1) Puxa a lista de device_ids
  useEffect(() => {
    axios.get('http://localhost:8000/api/devices/') // supondo endpoint que retorna ["ESP1","ESP2",...]
      .then(res => setDeviceList(res.data))
      .catch(err => console.error('Erro ao buscar devices', err))
  }, [])

  const handleSelect = (e: SelectChangeEvent<string>) => {
    setSelectedDevice(e.target.value)
    // zerar mensagens e forçar reload
    setGlobalError(null)
    setGlobalSuccess(null)
    setRefreshKey(k => k + 1)
  }

  const handleClearReadings = async () => {
    if (!selectedDevice) return
    if (!confirm(`Apagar TODAS as leituras de ${selectedDevice}?`)) return
    setLoadingClear(true)
    try {
      const res = await axios.delete<ClearResponse>(
        `http://localhost:8000/api/${selectedDevice}/temperature/clear`
      )
      setGlobalSuccess(res.data.message)
      setRefreshKey(k => k + 1)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ detail: string }>
        setGlobalError(axiosErr.response?.data.detail || 'Erro ao limpar dados')
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

        {/* 1. Seletor de dispositivo */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="select-device-label">Selecionar ESP32</InputLabel>
          <Select
            labelId="select-device-label"
            value={selectedDevice}
            label="Selecionar ESP32"
            onChange={handleSelect}
          >
            {deviceList.map(id => (
              <MenuItem key={id} value={id}>{id}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 2. Mensagens globais */}
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

        {/* 3. Botões de ação (só habilita se tiver device) */}
        <Fab
          color="error"
          aria-label="Limpar leituras"
          onClick={handleClearReadings}
          disabled={loadingClear || !selectedDevice}
          sx={{
            position: 'fixed', bottom: 90, right: 24, zIndex: 1500,
          }}
        >
          {loadingClear
            ? <CircularProgress size={20} color="inherit" />
            : <DeleteIcon />
          }
        </Fab>

        <Fab
          color="primary"
          aria-label="Adicionar e-mail"
          onClick={() => setPopupOpen(true)}
          sx={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1500,
          }}
        >
          <AddIcon />
        </Fab>

        <PopupCard open={popupOpen} onClose={() => setPopupOpen(false)}>
          <EmailRecipientsManager />
        </PopupCard>

        {/* 4. Exibe dados apenas se device escolhido */}
        {selectedDevice
          ? (
            <>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <LatestTemperature
                  key={refreshKey}
                  deviceId={selectedDevice}
                />
              </Box>
              <Box sx={{ mt: 4 }}>
                <TemperatureChart
                  key={`chart-${refreshKey}`}
                  deviceId={selectedDevice}
                />
              </Box>
            </>
          )
          : (
            <Typography variant="h6" color="text.secondary" align="center">
              Selecione um ESP32 para visualizar os dados.
            </Typography>
          )
        }
      </Container>
    </MainLayout>
  )
}
