// components/MainLayout.js
import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';

export default function MainLayout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={()=>setOpen(true)}><MenuIcon/></IconButton>
          <Typography variant="h6">Health IoT Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={()=>setOpen(false)}>
        <List sx={{ width: 240 }}>
          <ListItem button><ListItemIcon><HomeIcon/></ListItemIcon><ListItemText primary="Dashboard"/></ListItem>
          <ListItem button><ListItemIcon><EmailIcon/></ListItemIcon><ListItemText primary="E-mails"/></ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ mt: 8, ml: open? 24:0, p: 3, transition: 'margin .3s' }}>
        {children}
      </Box>
    </>
  );
}
