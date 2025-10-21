const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const videoController = require('../controllers/videoController');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.env.STORAGE_PATH || '../storage', 'temp');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 5368709120) // 5GB default
  }
});

// Routes
router.get('/', authenticate, videoController.getAllVideos);
router.get('/:id', authenticate, videoController.getVideoById);
router.post('/upload', authenticate, authorize('admin', 'editor'), upload.single('video'), videoController.uploadVideo);
router.put('/:id', authenticate, authorize('admin', 'editor'), videoController.updateVideo);
router.delete('/:id', authenticate, authorize('admin'), videoController.deleteVideo);
router.post('/:id/transcode', authenticate, authorize('admin', 'editor'), videoController.transcodeVideo);
router.get('/:id/status', authenticate, videoController.getTranscodingStatus);

module.exports = router;
