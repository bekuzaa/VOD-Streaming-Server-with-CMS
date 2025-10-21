const mongoose = require('mongoose');

const qualitySchema = new mongoose.Schema({
  resolution: String,
  bitrate: String,
  path: String,
  size: Number
}, { _id: false });

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  size: {
    type: Number, // in bytes
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  thumbnailPath: {
    type: String
  },
  hlsMasterPlaylist: {
    type: String
  },
  qualities: [qualitySchema],
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed', 'deleted'],
    default: 'uploading'
  },
  transcodingProgress: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  bandwidth: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowedDomains: [{
    type: String
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    codec: String,
    width: Number,
    height: Number,
    fps: Number,
    aspectRatio: String
  }
}, {
  timestamps: true
});

// Indexes for performance
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ status: 1 });
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
