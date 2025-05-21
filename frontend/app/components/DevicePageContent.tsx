'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Box, CircularProgress } from '@mui/material'

const LatestTemperature = dynamic(
  () => import('@/components/LatestTemperature'),
  { ssr: false, loading: () => <CircularProgress /> }
)

const TemperatureChart = dynamic(
  () => import('@/components/TemperatureChart'),
  { ssr: false, loading: () => <CircularProgress /> }
)

interface Props {
  deviceId: string
}

export default function DevicePageContent({ deviceId }: Props) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      }
    >
      <Box sx={{ mb: 4 }}>
        <LatestTemperature deviceId={deviceId} />
      </Box>
      <Box sx={{ mb: 4 }}>
        <TemperatureChart deviceId={deviceId} />
      </Box>
    </Suspense>
  )
}
