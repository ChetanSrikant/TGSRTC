// components/DashboardHeader.js
'use client';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function DashboardHeader({ title = 'Dashboard' }) {
  return (
    <AppBar position="static" sx={{ mb: 4, borderRadius: 1, boxShadow: 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Button color="inherit" component={Link} href="/dashboard">
          Dashboard
        </Button>
      </Toolbar>
    </AppBar>
  );
}