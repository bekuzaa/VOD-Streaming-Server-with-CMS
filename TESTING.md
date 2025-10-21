# Testing Guide

## Quick Test with Docker

```bash
# Start services
docker-compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Test health endpoint
curl http://localhost:5000/api/health

# Expected output:
# {"success":true,"status":"OK","timestamp":"..."}
```

## Manual Testing

### 1. Backend API Tests

```bash
cd backend
npm install
npm test
```

### 2. Login Test

```bash
# Login with default credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Save the token from response
export TOKEN="your_token_here"
```

### 3. Video Upload Test

```bash
# Upload a test video
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@test-video.mp4" \
  -F "title=Test Video" \
  -F "description=This is a test video"
```

### 4. Get Videos Test

```bash
curl -X GET http://localhost:5000/api/videos \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Transcoding Test

```bash
# Get video ID from previous response
export VIDEO_ID="your_video_id_here"

# Start transcoding
curl -X POST http://localhost:5000/api/videos/$VIDEO_ID/transcode \
  -H "Authorization: Bearer $TOKEN"

# Check transcoding status
curl -X GET http://localhost:5000/api/videos/$VIDEO_ID/status \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Streaming Token Test

```bash
# Generate streaming token
curl -X GET http://localhost:5000/api/stream/token/$VIDEO_ID \
  -H "Authorization: Bearer $TOKEN"

# Use token in HLS player
# http://localhost:8080/stream/$VIDEO_ID/master.m3u8?token=YOUR_TOKEN
```

## Load Testing

```bash
# Install Apache Bench
# Ubuntu/Debian: sudo apt-get install apache2-utils
# macOS: brew install httpd

# Run load test
ab -n 1000 -c 10 http://localhost:5000/api/health
```

## Frontend Testing

```bash
cd frontend
npm install
npm test
```

## Integration Testing

Run the test script:

```bash
chmod +x scripts/test-upload.sh
./scripts/test-upload.sh
```

## Performance Testing

### 1. Database Performance

```bash
# Connect to MongoDB
docker exec -it vod_mongodb mongosh -u admin -p admin123

# Run explain on queries
use vod_streaming
db.videos.find({status: "ready"}).explain("executionStats")
```

### 2. Memory Usage

```bash
# Monitor backend memory
docker stats vod_backend
```

### 3. Transcoding Performance

Upload multiple videos and monitor:
- CPU usage
- Memory usage
- Disk I/O
- Transcoding time

## Security Testing

### 1. Token Expiration

```bash
# Generate token with short expiry
curl -X GET "http://localhost:5000/api/stream/token/$VIDEO_ID?expiresIn=5" \
  -H "Authorization: Bearer $TOKEN"

# Wait 10 seconds and try to use expired token
# Should return 401 Unauthorized
```

### 2. Domain Validation

```bash
# Try accessing stream from unauthorized domain
curl -X GET "http://localhost:8080/stream/$VIDEO_ID/master.m3u8?token=$STREAM_TOKEN" \
  -H "Referer: http://unauthorized-domain.com"

# Should return 403 Forbidden
```

### 3. Rate Limiting

```bash
# Send many requests quickly
for i in {1..150}; do
  curl http://localhost:5000/api/health
done

# Should start returning 429 Too Many Requests
```

## Automated Testing

Create test suite:

```javascript
// backend/test/api.test.js
const request = require('supertest');
const app = require('../src/server');

describe('API Tests', () => {
  let token;
  
  it('should login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    token = res.body.data.token;
  });
  
  it('should get videos', async () => {
    const res = await request(app)
      .get('/api/videos')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
```

Run tests:
```bash
npm test
```

## Test Checklist

- [ ] Backend API endpoints
- [ ] Authentication & Authorization
- [ ] Video upload
- [ ] Video transcoding
- [ ] HLS streaming
- [ ] Token generation & validation
- [ ] Domain whitelisting
- [ ] Rate limiting
- [ ] Error handling
- [ ] Database operations
- [ ] File storage
- [ ] Frontend pages
- [ ] User interface
- [ ] Mobile responsiveness

## Troubleshooting Tests

### Backend not starting
- Check MongoDB connection
- Check Redis connection
- Verify environment variables
- Check port availability

### Upload failing
- Check file size limits
- Verify FFmpeg installation
- Check storage permissions
- Monitor disk space

### Transcoding errors
- Verify FFmpeg installation
- Check video format support
- Monitor system resources
- Review transcoding logs

### Streaming issues
- Verify token generation
- Check HLS files exist
- Review Caddy logs
- Test domain whitelisting

## Continuous Testing

Set up GitHub Actions or similar CI/CD:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          docker-compose up -d
          sleep 30
          ./scripts/test-upload.sh
```
