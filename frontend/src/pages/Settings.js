import React from 'react';
import { Container, Typography } from '@mui/material';

function Settings() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4">Settings</Typography>
      <Typography>Configure your streaming server settings here.</Typography>
    </Container>
  );
}

export default Settings;
