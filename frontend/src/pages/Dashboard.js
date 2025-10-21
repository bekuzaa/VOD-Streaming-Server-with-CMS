import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { VideoLibrary, CloudUpload, Settings, Monitor } from '@mui/icons-material';
import { monitoringAPI, videoAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [videoStats, systemStats] = await Promise.all([
          monitoringAPI.getVideoStats(),
          monitoringAPI.getSystemStats()
        ]);
        setStats({ video: videoStats.data.data, system: systemStats.data.data });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  const menuItems = [
    { title: 'Videos', icon: <VideoLibrary />, link: '/videos', color: '#1976d2' },
    { title: 'Upload', icon: <CloudUpload />, link: '/upload', color: '#2e7d32' },
    { title: 'Settings', icon: <Settings />, link: '/settings', color: '#ed6c02' },
    { title: 'Monitoring', icon: <Monitor />, link: '/monitoring', color: '#9c27b0' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card component={Link} to={item.link} sx={{ textDecoration: 'none', bgcolor: item.color }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                  {item.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>{item.title}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Total Videos</Typography>
                <Typography variant="h4">{stats.video.videos.total}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Total Views</Typography>
                <Typography variant="h4">{stats.video.views}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Storage</Typography>
                <Typography variant="h4">{stats.video.storage.totalSizeGB} GB</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">CPU Usage</Typography>
                <Typography variant="h4">{stats.system.system.memory.usagePercent}%</Typography>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
}

export default Dashboard;
