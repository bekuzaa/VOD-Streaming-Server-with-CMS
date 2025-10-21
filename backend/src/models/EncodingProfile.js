const mongoose = require('mongoose');

const encodingProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  codec: {
    type: String,
    enum: ['h264', 'h265', 'vp9', 'av1'],
    default: 'h264'
  },
  presets: [{
    resolution: {
      type: String,
      required: true,
      enum: ['240p', '360p', '480p', '720p', '1080p', '1440p', '2160p', 'custom']
    },
    width: Number,
    height: Number,
    videoBitrate: String,
    audioBitrate: String,
    fps: Number,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EncodingProfile', encodingProfileSchema);
