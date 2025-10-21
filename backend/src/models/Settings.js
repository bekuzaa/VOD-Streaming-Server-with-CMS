const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object'],
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['general', 'security', 'streaming', 'transcoding', 'storage'],
    default: 'general'
  },
  isEditable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
