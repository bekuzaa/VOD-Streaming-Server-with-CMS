const Video = require('../models/Video');
const { generateStreamToken, verifyStreamToken, validateDomain } = require('../utils/tokenGenerator');
const logger = require('../utils/logger');

exports.generateToken = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { expiresIn, domain } = req.query;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (video.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Video is not ready for streaming' });
    }

    const allowedDomains = video.allowedDomains.length > 0 ? video.allowedDomains : process.env.ALLOWED_DOMAINS?.split(',') || [];
    const tokenData = generateStreamToken(videoId, { expiresIn: expiresIn || process.env.TOKEN_EXPIRY, allowedDomains });

    logger.info(\`Streaming token generated for video: \${videoId} by user: \${req.user.email}\`);

    res.json({ success: true, data: { token: tokenData.token, expiresAt: tokenData.expiresAt, expiresIn: tokenData.expiresIn, videoId, streamUrl: \`/stream/\${videoId}/master.m3u8?token=\${tokenData.token}\` } });
  } catch (error) {
    logger.error('Generate token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { token } = req.query;
    const referer = req.headers.referer || req.headers.origin || '';

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is required' });
    }

    const verification = verifyStreamToken(token);
    if (!verification.valid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (verification.payload.videoId !== videoId) {
      return res.status(403).json({ success: false, message: 'Token does not match video ID' });
    }

    const allowedDomains = verification.payload.allowedDomains || [];
    const domain = new URL(referer || 'http://localhost').hostname;

    if (!validateDomain(allowedDomains, domain)) {
      logger.warn(\`Access denied from domain: \${domain}\`);
      return res.status(403).json({ success: false, message: 'Access denied from this domain' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    video.views += 1;
    await video.save();

    res.json({ success: true, message: 'Token verified', data: { videoId, hlsPath: \`/hls/\${videoId}/master.m3u8\` } });
  } catch (error) {
    logger.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
