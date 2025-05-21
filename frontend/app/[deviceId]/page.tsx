// **Não** use 'use client' aqui — continua sendo um Server Component

import React from 'react'
import { Box, Typography } from '@mui/material'
import MainLayout from '@/components/MainLayout'
import DevicePageContent from '@/components/DevicePageContent'

// Note que o componente agora é async
interface PageProps {
  params: Promise<{ deviceId: string }>
}

export default async function DevicePage({ params }: PageProps) {
  // Aguarda a resolução de params
  const { deviceId } = await params

  return (
    <MainLayout>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1">
          Dispositivo: <strong>{deviceId}</strong>
        </Typography>
      </Box>
      <DevicePageContent deviceId={deviceId} />
    </MainLayout>
  )
}
