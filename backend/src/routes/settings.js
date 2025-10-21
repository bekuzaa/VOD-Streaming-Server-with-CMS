const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

router.get('/', authenticate, settingsController.getAllSettings);
router.get('/:key', authenticate, settingsController.getSettingByKey);
router.put('/:key', authenticate, authorize('admin'), settingsController.updateSetting);
router.post('/', authenticate, authorize('admin'), settingsController.createSetting);
router.delete('/:key', authenticate, authorize('admin'), settingsController.deleteSetting);

module.exports = router;
