const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  authController.register
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;
