import { Box, Button } from '@mui/material'

interface PopupCardProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function PopupCard({ open, onClose, children }: PopupCardProps) {
  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          minWidth: 400,
          minHeight: 300, 
          maxWidth: '80vw', 
          maxHeight: '80vh', 
          overflowY: 'auto', 
        }}
      >
        {children}
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{ mt: 2 }}
        >
          Close
        </Button>
      </Box>
    </Box>
  )
}