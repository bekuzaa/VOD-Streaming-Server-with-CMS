# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Videos

#### GET /api/videos
Get all videos (paginated).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search query
- `status` (string): Filter by status
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 5,
      "limit": 20
    }
  }
}
```

#### GET /api/videos/:id
Get video by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "video": {
      "_id": "...",
      "title": "My Video",
      "description": "...",
      "duration": 120,
      "status": "ready",
      "qualities": [...],
      ...
    }
  }
}
```

#### POST /api/videos/upload
Upload a new video (multipart/form-data).

**Form Data:**
- `video` (file): Video file
- `title` (string): Video title
- `description` (string): Description (optional)
- `tags` (array): Tags (optional)
- `category` (string): Category (optional)

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "video": { ... }
  }
}
```

#### PUT /api/videos/:id
Update video metadata.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["tag1", "tag2"],
  "isPublic": true
}
```

#### DELETE /api/videos/:id
Delete a video.

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

#### POST /api/videos/:id/transcode
Start video transcoding to HLS.

**Response:**
```json
{
  "success": true,
  "message": "Transcoding started",
  "data": {
    "video": { ... }
  }
}
```

#### GET /api/videos/:id/status
Get transcoding status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 45
  }
}
```

### Streaming

#### GET /api/stream/token/:videoId
Generate streaming token.

**Query Parameters:**
- `expiresIn` (number): Token expiration in seconds (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "expiresAt": "2025-01-01T00:00:00.000Z",
    "expiresIn": 3600,
    "videoId": "...",
    "streamUrl": "/stream/:videoId/master.m3u8?token=..."
  }
}
```

#### GET /api/stream/verify/:videoId
Verify streaming token (used internally by Caddy).

**Query Parameters:**
- `token` (string): Streaming token

### Settings

#### GET /api/settings
Get all settings (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "site_name": {
      "value": "VOD Streaming Server",
      "type": "string",
      "category": "general"
    },
    ...
  }
}
```

#### PUT /api/settings/:key
Update setting value (Admin only).

**Request Body:**
```json
{
  "value": "New Value"
}
```

### Monitoring

#### GET /api/monitoring/stats
Get system statistics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "memory": { ... },
      "cpu": { ... }
    },
    "process": { ... }
  }
}
```

#### GET /api/monitoring/videos
Get video statistics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": {
      "total": 100,
      "ready": 95,
      "processing": 3,
      "failed": 2
    },
    "views": 10000,
    "storage": {
      "totalSize": 5368709120,
      "totalSizeGB": "5.00"
    }
  }
}
```

#### GET /api/monitoring/health
Health check endpoint (public).

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
