// app/Providers.tsx
'use client'

import { ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { healthTheme } from '@/theme'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={healthTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
