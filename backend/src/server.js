const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const streamRoutes = require('./routes/stream');
const settingsRoutes = require('./routes/settings');
const monitoringRoutes = require('./routes/monitoring');

const app = express();
const PORT = process.env.PORT || 5000;

// Redis Client
let redisClient;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient?.isOpen ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Error handling
app.use(errorHandler);

// Initialize connections
async function initializeApp() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('✅ Connected to MongoDB');

    // Connect to Redis
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('✅ Connected to Redis'));

    await redisClient.connect();

    // Make redis client available globally
    app.locals.redisClient = redisClient;

    // Start server
    app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      logger.info(`🚀 VOD Streaming Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api`);
    });

  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  await redisClient?.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  await redisClient?.quit();
  process.exit(0);
});

// Start the application
initializeApp();

module.exports = app;
