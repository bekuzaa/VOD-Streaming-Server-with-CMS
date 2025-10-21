const fs = require('fs').promises;
const path = require('path');
const Video = require('../models/Video');
const transcoder = require('../services/transcoder');
const logger = require('../utils/logger');

const transcodingProgress = new Map();

exports.getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (status) query.status = status;
    if (category) query.category = category;
    if (req.user.role !== 'admin') query.uploadedBy = req.user._id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .populate('uploadedBy', 'username email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: { videos, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) } } });
  } catch (error) {
    logger.error('Get all videos error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploadedBy', 'username email');
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (req.user.role !== 'admin' && video.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: { video } });
  } catch (error) {
    logger.error('Get video by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file uploaded' });
    const { title, description, tags, category, allowedDomains } = req.body;
    const metadata = await transcoder.getVideoMetadata(req.file.path);
    const video = new Video({ title: title || req.file.originalname, description, originalFilename: req.file.originalname, filename: req.file.filename, size: req.file.size, mimeType: req.file.mimetype, duration: metadata.duration, metadata: { codec: metadata.codec, width: metadata.width, height: metadata.height, fps: metadata.fps, aspectRatio: metadata.aspectRatio }, tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [], category, allowedDomains: allowedDomains ? (Array.isArray(allowedDomains) ? allowedDomains : allowedDomains.split(',')) : [], uploadedBy: req.user._id, status: 'ready' });
    await video.save();
    const storagePath = path.join(process.env.STORAGE_PATH || '../storage', 'videos');
    await fs.mkdir(storagePath, { recursive: true });
    const permanentPath = path.join(storagePath, video.filename);
    await fs.rename(req.file.path, permanentPath);
    res.status(201).json({ success: true, message: 'Video uploaded successfully', data: { video } });
  } catch (error) {
    logger.error('Upload video error:', error);
    if (req.file?.path) try { await fs.unlink(req.file.path); } catch (e) {}
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (req.user.role !== 'admin' && video.uploadedBy.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });
    const { title, description, tags, category, isPublic, allowedDomains } = req.body;
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (tags) video.tags = Array.isArray(tags) ? tags : tags.split(',');
    if (category) video.category = category;
    if (isPublic !== undefined) video.isPublic = isPublic;
    if (allowedDomains) video.allowedDomains = Array.isArray(allowedDomains) ? allowedDomains : allowedDomains.split(',');
    await video.save();
    res.json({ success: true, message: 'Video updated successfully', data: { video } });
  } catch (error) {
    logger.error('Update video error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (req.user.role !== 'admin' && video.uploadedBy.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });
    const storagePath = path.join(process.env.STORAGE_PATH || '../storage');
    try { await fs.unlink(path.join(storagePath, 'videos', video.filename)); } catch (e) {}
    try { await fs.rm(path.join(storagePath, 'hls', video._id.toString()), { recursive: true, force: true }); } catch (e) {}
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    logger.error('Delete video error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.transcodeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (video.status === 'processing') return res.status(400).json({ success: false, message: 'Video is already being transcoded' });
    video.status = 'processing';
    video.transcodingProgress = 0;
    await video.save();
    const storagePath = path.join(process.env.STORAGE_PATH || '../storage');
    const inputPath = path.join(storagePath, 'videos', video.filename);
    const outputDir = path.join(storagePath, 'hls', video._id.toString());
    setImmediate(async () => {
      try {
        const result = await transcoder.transcodeToHLS(inputPath, outputDir, (process.env.TRANSCODE_QUALITIES || '720p,480p,360p').split(','), (progress) => { video.transcodingProgress = Math.round(progress.percent || 0); video.save().catch(e => {}); });
        video.hlsMasterPlaylist = result.masterPlaylist;
        video.qualities = result.qualities;
        video.status = 'ready';
        video.transcodingProgress = 100;
        await video.save();
      } catch (error) {
        video.status = 'failed';
        await video.save();
      }
    });
    res.json({ success: true, message: 'Transcoding started', data: { video } });
  } catch (error) {
    logger.error('Transcode video error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTranscodingStatus = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: { status: video.status, progress: video.transcodingProgress } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
