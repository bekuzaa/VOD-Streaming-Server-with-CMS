const mongoose = require('mongoose');

const qualitySchema = new mongoose.Schema({
  resolution: String,
  width: Number,
  height: Number,
  bitrate: String,
  codec: String,
  path: String,
  size: Number,
  fps: Number
}, { _id: false });

const thumbnailSchema = new mongoose.Schema({
  url: String,
  path: String,
  timestamp: Number,
  width: Number,
  height: Number,
  isPrimary: {
    type: Boolean,
    default: false
  }
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
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Thumbnails (1-5 pictures)
  thumbnails: [thumbnailSchema],
  
  // Primary thumbnail (for display)
  primaryThumbnail: {
    type: String
  },
  
  // HLS Output
  hlsMasterPlaylist: {
    type: String
  },
  
  // Multiple quality outputs
  qualities: [qualitySchema],
  
  // Encoding settings used
  encodingProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EncodingProfile'
  },
  
  // Storage configuration
  storageType: {
    type: String,
    enum: ['local', 's3', 'gcs', 'azure', 'cloudinary'],
    default: 'local'
  },
  storageLocation: {
    bucket: String,
    region: String,
    path: String,
    url: String
  },
  
  // Watermark
  watermark: {
    enabled: {
      type: Boolean,
      default: false
    },
    path: String,
    position: {
      type: String,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      default: 'bottom-right'
    },
    opacity: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed', 'deleted'],
    default: 'uploading'
  },
  transcodingProgress: {
    type: Number,
    default: 0
  },
  transcodingStartedAt: Date,
  transcodingCompletedAt: Date,
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  bandwidth: {
    type: Number,
    default: 0
  },
  
  // Metadata
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
  
  // Video metadata
  metadata: {
    codec: String,
    width: Number,
    height: Number,
    fps: Number,
    aspectRatio: String,
    bitrate: Number,
    audioCodec: String,
    audioChannels: Number,
    audioSampleRate: Number
  }
}, {
  timestamps: true
});

// Indexes
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ status: 1 });
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ storageType: 1 });

module.exports = mongoose.model('Video', videoSchema);
