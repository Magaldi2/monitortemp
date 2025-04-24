import { useState, useEffect } from 'react'
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material'
import axios from 'axios'

export default function AlertTemperatureForm() {
  const [temp, setTemp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [inputError, setInputError] = useState(false)

  useEffect(() => {
    const fetchAlertTemp = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/api/alert-temperature/')
        setTemp(data.alert_temperature)
      } catch (error) {
        setError('Falha ao carregar configuração atual do servidor')
        console.error('Erro ao buscar temperatura:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAlertTemp()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (temp === null || temp < -20 || temp > 100) {
      setInputError(true)
      setError('Por favor, insira uma temperatura entre -20°C e 100°C')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setInputError(false)

    try {
      await axios.post('http://localhost:8000/api/alert-temperature/', {
        temperature: temp
      })
      setSuccess(`Alerta configurado para ${temp}°C com sucesso!`)
      setTimeout(() => setSuccess(null), 5000)
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Erro ao salvar configuração'
      setError(errorMessage)
      console.error('Erro ao salvar temperatura:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTempChange = (e) => {
    const value = parseFloat(e.target.value)
    setTemp(isNaN(value) ? null : value)
    setInputError(false)
    setError(null)
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        mt: 4
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Configuração de Alerta de Temperatura
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        margin="normal"
        label="Temperatura de Alerta (°C)"
        type="number"
        value={temp ?? ''}
        onChange={handleTempChange}
        error={inputError}
        helperText={inputError ? 'Valor deve estar entre -20°C e 100°C' : ''}
        InputProps={{
          inputProps: { 
            min: -20,
            max: 100,
            step: 0.5
          },
          endAdornment: '°C'
        }}
        disabled={loading}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading || temp === null}
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        {loading ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1, color: 'inherit' }} />
            Salvando...
          </>
        ) : 'Salvar Configuração'}
      </Button>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        O sistema irá notificar quando a temperatura ultrapassar {temp ?? '--'}°C
      </Typography>
    </Box>
  )
}