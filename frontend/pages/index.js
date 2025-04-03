import Head from 'next/head';
import { Container, Box, Card, Typography } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';

export default function Home() {
  // Dados estáticos de exemplo
  const latestTemp = {
    temperature: 25.5,
    created_at: new Date().toISOString()
  };

  return (
    <>
      <Head>
        <title>Dashboard de Temperatura IoT</title>
        <meta name="description" content="Monitoramento de temperatura com ESP32" />
      </Head>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Card de Temperatura Atual (Estático) */}
          <Card sx={{ minWidth: 275, marginBottom: 2 }}>
            <Typography variant="h5" component="div" gutterBottom sx={{ p: 2 }}>
              <ThermostatIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
              Temperatura Atual (Exemplo)
            </Typography>
            <Typography variant="h3" sx={{ textAlign: 'center', my: 2 }}>
              25.5°C
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'right', p: 2 }}>
              Atualizado: {new Date().toLocaleTimeString()}
            </Typography>
          </Card>

          {/* Espaço reservado para o gráfico */}
          <Card sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gráfico de Temperatura (Simulado)
            </Typography>
            <Box sx={{ 
              background: 'linear-gradient(45deg, #f5f5f5 25%, #e0e0e0 50%, #f5f5f5 75%)',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1
            }}>
              <Typography color="text.secondary">
                Área do gráfico (sem conexão com o backend)
              </Typography>
            </Box>
          </Card>
        </Box>
      </Container>
    </>
  );
}