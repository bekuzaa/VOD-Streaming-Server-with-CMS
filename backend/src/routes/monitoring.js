const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const monitoringController = require('../controllers/monitoringController');

router.get('/stats', authenticate, authorize('admin'), monitoringController.getSystemStats);
router.get('/videos', authenticate, authorize('admin'), monitoringController.getVideoStats);
router.get('/bandwidth', authenticate, authorize('admin'), monitoringController.getBandwidthStats);
router.get('/health', monitoringController.healthCheck);

module.exports = router;
