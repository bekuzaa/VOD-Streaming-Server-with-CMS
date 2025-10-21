import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { monitoringAPI } from '../services/api';

function Monitoring() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [video, system] = await Promise.all([monitoringAPI.getVideoStats(), monitoringAPI.getSystemStats()]);
      setStats({ video: video.data.data, system: system.data.data });
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Monitoring</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">System Stats</Typography>
            <Typography>CPU: {stats.system.system.cpu.count} cores</Typography>
            <Typography>Memory: {stats.system.system.memory.usagePercent}% used</Typography>
            <Typography>Uptime: {Math.round(stats.system.process.uptime / 3600)}h</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Video Stats</Typography>
            <Typography>Total: {stats.video.videos.total}</Typography>
            <Typography>Ready: {stats.video.videos.ready}</Typography>
            <Typography>Processing: {stats.video.videos.processing}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Monitoring;
