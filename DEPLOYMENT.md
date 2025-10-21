# Deployment Guide

## Prerequisites

- Domain name
- VPS/Cloud server (minimum 4GB RAM, 2 CPU cores, 100GB storage)
- Docker & Docker Compose installed
- SSH access to server

## Quick Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y
```

### 2. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/vod-streaming-server.git
cd vod-streaming-server
```

### 3. Configure Environment

```bash
# Copy production environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production

# Set secure passwords and keys
MONGO_USER=admin
MONGO_PASSWORD=your_secure_password_here
REDIS_PASSWORD=your_redis_password_here
JWT_SECRET=your_very_long_random_secret_key_here
DOMAIN=yourdomain.com
EMAIL=your-email@example.com
```

```bash
# Backend environment
cp backend/.env.example backend/.env
nano backend/.env

# Update these values:
NODE_ENV=production
MONGODB_URI=mongodb://admin:your_password@mongodb:27017/vod_streaming?authSource=admin
REDIS_URL=redis://:your_redis_password@redis:6379
JWT_SECRET=your_jwt_secret
ALLOWED_DOMAINS=yourdomain.com,www.yourdomain.com
```

```bash
# Frontend environment
cp frontend/.env.example frontend/.env
nano frontend/.env

# Update:
REACT_APP_API_URL=https://yourdomain.com
REACT_APP_STREAM_URL=https://yourdomain.com
```

### 4. Update Caddy Configuration

```bash
nano caddy/Caddyfile

# Update domain configuration:
yourdomain.com {
    encode gzip zstd
    
    tls your-email@example.com
    
    # ... rest of configuration
}
```

### 5. Deploy with Docker

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 6. Create Admin User

```bash
# Access MongoDB container
docker exec -it vod_mongodb_prod mongosh -u $MONGO_USER -p $MONGO_PASSWORD

# Switch to database
use vod_streaming

# Create admin user
db.users.insertOne({
  username: "admin",
  email: "admin@yourdomain.com",
  password: "$2a$10$...", // Use bcrypt hash
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 7. SSL Certificate

Caddy will automatically obtain SSL certificate from Let's Encrypt on first access.

```bash
# Test HTTPS
curl https://yourdomain.com/api/health
```

### 8. Firewall Setup

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Alternative Deployments

### AWS EC2

1. Launch EC2 instance (t3.medium or larger)
2. Configure Security Group (ports 80, 443, 22)
3. Attach Elastic IP
4. Follow server setup above
5. Use S3 for video storage (optional)

### DigitalOcean Droplet

1. Create Droplet (4GB RAM minimum)
2. Point domain to Droplet IP
3. Follow server setup above

### Google Cloud Platform

1. Create Compute Engine instance
2. Configure firewall rules
3. Reserve static IP
4. Follow server setup above

### Azure VM

1. Create Virtual Machine
2. Configure Network Security Group
3. Assign public IP
4. Follow server setup above

## Kubernetes Deployment

For high-scale deployments:

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vod-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vod-backend
  template:
    metadata:
      labels:
        app: vod-backend
    spec:
      containers:
      - name: backend
        image: yourusername/vod-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: vod-secrets
              key: mongodb-uri
```

## CDN Integration

### CloudFlare

1. Point domain to CloudFlare
2. Configure DNS records
3. Enable CDN caching
4. Set cache rules for HLS files

### AWS CloudFront

1. Create distribution
2. Set origin to your server
3. Configure caching behavior
4. Update stream URLs

## Monitoring & Maintenance

### Setup Monitoring

```bash
# Install monitoring tools
docker run -d \
  --name=grafana \
  -p 3001:3000 \
  grafana/grafana

# Configure alerts
```

### Backup Strategy

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
mkdir -p /backups

# Backup MongoDB
docker exec vod_mongodb_prod mongodump --out /backups/mongo-$DATE

# Backup videos
tar -czf /backups/videos-$DATE.tar.gz /opt/vod-streaming-server/storage/videos

# Upload to S3 (optional)
aws s3 cp /backups/mongo-$DATE s3://your-backup-bucket/
EOF

chmod +x backup.sh

# Add to crontab
crontab -e
# 0 2 * * * /opt/vod-streaming-server/backup.sh
```

### Updates

```bash
# Pull latest changes
cd /opt/vod-streaming-server
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f
```

## Performance Optimization

### Enable Caching

```bash
# Redis caching
# Already configured in backend

# Caddy caching
# Add to Caddyfile:
header /stream/* {
    Cache-Control "public, max-age=3600"
}
```

### Database Optimization

```bash
# Create indexes
docker exec -it vod_mongodb_prod mongosh -u $MONGO_USER -p $MONGO_PASSWORD

use vod_streaming

db.videos.createIndex({ title: "text", description: "text" })
db.videos.createIndex({ status: 1, createdAt: -1 })
db.videos.createIndex({ uploadedBy: 1 })
```

### Storage Optimization

```bash
# Mount separate volume for storage
# Add to docker-compose:
volumes:
  - /mnt/videos:/app/storage

# Or use network storage (NFS, S3FS)
```

## Scaling

### Horizontal Scaling

1. Setup load balancer
2. Deploy multiple backend instances
3. Share storage via NFS or S3
4. Use Redis for session management

### Vertical Scaling

1. Increase server resources
2. Optimize transcoding settings
3. Add more CPU cores
4. Increase RAM

## Security Hardening

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Setup fail2ban
sudo apt install fail2ban -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Regular updates
sudo apt update && sudo apt upgrade -y
```

## Troubleshooting

### Service not starting
```bash
docker-compose logs backend
docker-compose logs mongodb
docker-compose logs redis
```

### SSL issues
```bash
docker-compose logs caddy
# Check domain DNS
# Verify port 80/443 open
```

### High resource usage
```bash
docker stats
top
htop
```

## Rollback

```bash
# Rollback to previous version
git checkout previous-commit-hash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Support

For deployment issues:
- Check logs: `docker-compose logs`
- Review documentation
- Open GitHub issue
- Contact support
