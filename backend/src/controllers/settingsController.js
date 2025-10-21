const Settings = require('../models/Settings');
const logger = require('../utils/logger');

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    const settingsObj = {};
    settings.forEach(setting => { settingsObj[setting.key] = { value: setting.value, type: setting.type, description: setting.description, category: setting.category }; });
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    logger.error('Get all settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSettingByKey = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
    res.json({ success: true, data: setting });
  } catch (error) {
    logger.error('Get setting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const { key, value, type, description, category } = req.body;
    const existing = await Settings.findOne({ key });
    if (existing) return res.status(400).json({ success: false, message: 'Setting already exists' });
    const setting = new Settings({ key, value, type, description, category });
    await setting.save();
    logger.info(\`Setting created: \${key}\`);
    res.status(201).json({ success: true, data: setting });
  } catch (error) {
    logger.error('Create setting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
    if (!setting.isEditable) return res.status(403).json({ success: false, message: 'This setting cannot be edited' });
    const { value } = req.body;
    setting.value = value;
    await setting.save();
    logger.info(\`Setting updated: \${setting.key}\`);
    res.json({ success: true, data: setting });
  } catch (error) {
    logger.error('Update setting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
    await Settings.deleteOne({ key: req.params.key });
    logger.info(\`Setting deleted: \${req.params.key}\`);
    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    logger.error('Delete setting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
