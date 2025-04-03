import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';

const LatestTemperature = () => {
  const [latestTemp, setLatestTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestTemp = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/temperature/latest/');
        if (response.data) {
          setLatestTemp(response.data);
          setError(null);
        } else {
          setError('Nenhum dado encontrado');
        }
      } catch (err) {
        console.error('Error fetching latest temperature:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTemp();
    const interval = setInterval(fetchLatestTemp, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card sx={{ minWidth: 275, marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          <ThermostatIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
          Temperatura Atual
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : latestTemp ? (
          <>
            <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
              {latestTemp.temperature?.toFixed(1) || '--'}°C
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'right' }}>
              Atualizado: {latestTemp.created_at ? new Date(latestTemp.created_at).toLocaleTimeString() : '--'}
            </Typography>
          </>
        ) : (
          <Typography color="error">Não foi possível obter a temperatura</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestTemperature;