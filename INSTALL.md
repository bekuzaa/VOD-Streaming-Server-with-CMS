# Installation Guide

## Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose
- FFmpeg
- MongoDB 7+
- Redis 7+

## Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vod-streaming-server.git
cd vod-streaming-server
```

2. Create environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Stream Server: http://localhost:8080

5. Default login credentials:
- Email: admin@example.com
- Password: admin123

## Manual Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Caddy Setup

```bash
cd caddy
caddy run --config Caddyfile
```

## Production Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Configuration

### Backend Environment Variables

- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET`: Secret key for JWT tokens
- `TOKEN_EXPIRY`: Token expiration time in seconds
- `ALLOWED_DOMAINS`: Comma-separated list of allowed domains
- `STORAGE_PATH`: Path to storage directory
- `MAX_FILE_SIZE`: Maximum upload file size in bytes

### Frontend Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_STREAM_URL`: Streaming server URL

## Troubleshooting

### Video Upload Fails

1. Check file size limits in backend/.env
2. Verify storage directory permissions
3. Check available disk space

### Streaming Not Working

1. Verify token generation
2. Check domain whitelist settings
3. Ensure HLS files are generated
4. Review Caddy logs

### Database Connection Issues

1. Verify MongoDB is running
2. Check connection string in .env
3. Ensure network connectivity

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/vod-streaming-server/issues
- Email: support@yourdomain.com
