# 🎬 VOD Streaming Server with CMS

Enterprise-grade Video on Demand (VOD) streaming server with HLS output, secure token authentication, domain restriction, and comprehensive CMS management system.

## 🌟 Features

### Core Features
- ✅ **HLS Streaming** - Adaptive bitrate streaming with multiple quality levels
- ✅ **Secure Token Authentication** - Time-based token with expiration
- ✅ **Domain Whitelisting** - Restrict playback to authorized domains
- ✅ **CMS Dashboard** - Full-featured content management system
- ✅ **Auto SSL** - Automatic HTTPS with Caddy server
- ✅ **Scalable** - Supports 10,000+ video files
- ✅ **Monitoring** - Real-time system and streaming metrics
- ✅ **Multi-Quality** - Auto-transcode to multiple resolutions (1080p, 720p, 480p, 360p)

### Technical Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React.js + Material-UI
- **Database**: MongoDB (metadata) + Redis (caching)
- **Server**: Caddy (reverse proxy + auto SSL)
- **Transcoding**: FFmpeg
- **Monitoring**: Custom monitoring dashboard

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose
- FFmpeg
- MongoDB
- Redis
- Caddy Server (optional, included in Docker)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vod-streaming-server.git
cd vod-streaming-server
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit configuration
nano backend/.env
```

### 3. Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Manual Installation

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

#### Caddy Setup
```bash
cd caddy
caddy run --config Caddyfile
```

## 🔧 Configuration

### Backend Configuration (`backend/.env`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vod_streaming
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
TOKEN_EXPIRY=3600
ALLOWED_DOMAINS=example.com,yourdomain.com
STORAGE_PATH=../storage
MAX_FILE_SIZE=5368709120
```

### Frontend Configuration (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STREAM_URL=https://stream.yourdomain.com
```

### Caddy Configuration
See `caddy/Caddyfile` for reverse proxy and SSL configuration.

## 📖 API Documentation

### Authentication
```bash
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Video Management
```bash
GET    /api/videos              # List all videos
GET    /api/videos/:id          # Get video details
POST   /api/videos/upload       # Upload new video
PUT    /api/videos/:id          # Update video metadata
DELETE /api/videos/:id          # Delete video
POST   /api/videos/:id/transcode # Trigger transcoding
```

### Streaming
```bash
GET /api/stream/token/:videoId  # Generate streaming token
GET /stream/:videoId/master.m3u8?token=xxx # HLS playlist
```

### Settings
```bash
GET    /api/settings            # Get all settings
PUT    /api/settings            # Update settings
```

### Monitoring
```bash
GET /api/monitoring/stats       # System statistics
GET /api/monitoring/videos      # Video statistics
GET /api/monitoring/health      # Health check
```

## 🎮 Usage

### 1. Upload Video
```bash
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@myvideo.mp4" \
  -F "title=My Video" \
  -F "description=Video description"
```

### 2. Generate Streaming Token
```bash
curl http://localhost:5000/api/stream/token/VIDEO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Play Video
```javascript
// Using HLS.js
const video = document.getElementById('video');
const hls = new Hls();
hls.loadSource('https://stream.yourdomain.com/stream/VIDEO_ID/master.m3u8?token=TOKEN');
hls.attachMedia(video);
```

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────┐      ┌─────────────┐
│   Client    │─────▶│  Caddy   │─────▶│   Backend   │
│  (Browser)  │◀─────│  Server  │◀─────│   (API)     │
└─────────────┘      └──────────┘      └─────────────┘
                           │                    │
                           │                    │
                     ┌─────▼──────┐      ┌─────▼──────┐
                     │    HLS     │      │  MongoDB   │
                     │   Files    │      │   Redis    │
                     └────────────┘      └────────────┘
```

## 🔐 Security Features

1. **JWT Authentication** - Secure API access
2. **Streaming Tokens** - Time-limited, single-use tokens
3. **Domain Whitelisting** - Prevent unauthorized embedding
4. **CORS Protection** - Restrict API access
5. **Rate Limiting** - Prevent abuse
6. **Input Validation** - Sanitize all inputs
7. **Auto SSL/TLS** - Encrypted communication

## 📊 Monitoring

Access monitoring dashboard at: `http://localhost:5000/monitoring`

Metrics include:
- Active streams
- Bandwidth usage
- Video statistics
- System resources
- Error rates
- User activity

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

## 📦 Deployment

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production
```bash
# Backend
cd backend
npm run build
pm2 start npm --name "vod-backend" -- start

# Frontend
cd frontend
npm run build
# Serve build folder with nginx or caddy
```

## 🎯 Performance Optimization

- **CDN Integration** - Use CloudFlare or AWS CloudFront
- **Redis Caching** - Cache tokens and metadata
- **Database Indexing** - Optimize MongoDB queries
- **HLS Chunking** - Optimize segment duration
- **Compression** - Enable gzip/brotli
- **Load Balancing** - Use multiple backend instances

## 🛠️ Troubleshooting

### Video Not Playing
1. Check token validity
2. Verify domain whitelist
3. Check HLS files exist
4. Review Caddy logs

### Upload Fails
1. Check file size limits
2. Verify storage permissions
3. Check disk space
4. Review backend logs

### Transcoding Issues
1. Verify FFmpeg installation
2. Check system resources
3. Review transcoding logs
4. Validate input video format

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Your Name - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- FFmpeg for video processing
- Caddy for auto SSL
- HLS.js for video playback
- Material-UI for UI components

## 📮 Support

For support, email support@yourdomain.com or open an issue on GitHub.

---

Made with ❤️ for the streaming community
