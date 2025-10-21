const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.generateStreamToken = (videoId, options = {}) => {
  const {
    expiresIn = process.env.TOKEN_EXPIRY || 3600,
    allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || []
  } = options;

  const payload = {
    videoId,
    allowedDomains,
    type: 'stream',
    nonce: crypto.randomBytes(16).toString('hex')
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expiresIn)
  });

  return {
    token,
    expiresAt: new Date(Date.now() + parseInt(expiresIn) * 1000),
    expiresIn: parseInt(expiresIn)
  };
};

exports.verifyStreamToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'stream') {
      throw new Error('Invalid token type');
    }

    return {
      valid: true,
      payload: decoded
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

exports.validateDomain = (allowedDomains, requestDomain) => {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true;
  }

  if (!requestDomain) {
    return false;
  }

  return allowedDomains.some(domain => {
    const pattern = domain.replace(/\./g, '\.').replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`).test(requestDomain);
  });
};
