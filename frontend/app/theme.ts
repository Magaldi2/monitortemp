import { createTheme } from '@mui/material/styles';

export const healthTheme = createTheme({
  palette: {
    primary: { main: '#0288d1' },     // azul claro
    secondary: { main: '#26a69a' },   // verde água
    error: { main: '#d32f2f' },       // alerta vermelho
    background: { default: '#f1f9fc' },
    text: { primary: '#0d3b66', secondary: '#334e68' },
  },
  typography: {
    fontFamily: '"Inter","Roboto","Helvetica",sans-serif',
    h6: { fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
  shape: { borderRadius: 12 },
});
