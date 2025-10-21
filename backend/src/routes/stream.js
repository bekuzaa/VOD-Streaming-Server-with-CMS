const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { authenticate } = require('../middleware/auth');

// Generate streaming token
router.get('/token/:videoId', authenticate, streamController.generateToken);

// Verify token and serve HLS (this will be proxied by Caddy)
router.get('/verify/:videoId', streamController.verifyToken);

module.exports = router;
