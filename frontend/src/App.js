import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Videos from './pages/Videos';
import Upload from './pages/Upload';
import Settings from './pages/Settings';
import Monitoring from './pages/Monitoring';
import VideoPlayer from './pages/VideoPlayer';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/videos" element={<PrivateRoute><Videos /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/monitoring" element={<PrivateRoute><Monitoring /></PrivateRoute>} />
          <Route path="/player/:id" element={<PrivateRoute><VideoPlayer /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
