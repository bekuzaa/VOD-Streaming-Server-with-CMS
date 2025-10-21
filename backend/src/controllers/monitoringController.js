const os = require('os');
const Video = require('../models/Video');
const logger = require('../utils/logger');

exports.getSystemStats = async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();
    const uptime = process.uptime();

    res.json({ success: true, data: { system: { platform: os.platform(), arch: os.arch(), hostname: os.hostname(), uptime: os.uptime(), memory: { total: totalMem, free: freeMem, used: totalMem - freeMem, usagePercent: ((totalMem - freeMem) / totalMem * 100).toFixed(2) }, cpu: { count: cpus.length, model: cpus[0].model, speed: cpus[0].speed } }, process: { uptime, memoryUsage: process.memoryUsage(), pid: process.pid, nodeVersion: process.version } } });
  } catch (error) {
    logger.error('Get system stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getVideoStats = async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const readyVideos = await Video.countDocuments({ status: 'ready' });
    const processingVideos = await Video.countDocuments({ status: 'processing' });
    const failedVideos = await Video.countDocuments({ status: 'failed' });
    const totalViews = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const totalSize = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$size' } } }]);
    const totalDuration = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$duration' } } }]);

    res.json({ success: true, data: { videos: { total: totalVideos, ready: readyVideos, processing: processingVideos, failed: failedVideos }, views: totalViews[0]?.total || 0, storage: { totalSize: totalSize[0]?.total || 0, totalSizeGB: ((totalSize[0]?.total || 0) / (1024 ** 3)).toFixed(2) }, duration: { totalSeconds: totalDuration[0]?.total || 0, totalHours: ((totalDuration[0]?.total || 0) / 3600).toFixed(2) } } });
  } catch (error) {
    logger.error('Get video stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBandwidthStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const totalBandwidth = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$bandwidth' } } }]);
    res.json({ success: true, data: { bandwidth: { total: totalBandwidth[0]?.total || 0, totalGB: ((totalBandwidth[0]?.total || 0) / (1024 ** 3)).toFixed(2) } } });
  } catch (error) {
    logger.error('Get bandwidth stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.healthCheck = (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
};
