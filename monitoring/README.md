# Monitoring System

The VOD Streaming Server includes a built-in monitoring system that tracks:

## Metrics Tracked

### System Metrics
- CPU usage and load
- Memory usage (total, used, free)
- Disk space
- Network I/O
- Process uptime

### Video Metrics
- Total videos count
- Videos by status (ready, processing, failed)
- Total storage used
- Total video duration
- Total views

### Streaming Metrics
- Active streams
- Bandwidth usage
- Token generations
- Failed authentication attempts

## Accessing Monitoring

### API Endpoints

```bash
# System stats
GET /api/monitoring/stats

# Video stats
GET /api/monitoring/videos

# Bandwidth stats
GET /api/monitoring/bandwidth

# Health check
GET /api/monitoring/health
```

### Dashboard

Access the monitoring dashboard at: `http://localhost:3000/monitoring`

## Monitoring Integration

### Prometheus (Optional)

You can integrate with Prometheus by adding metrics export:

```javascript
// backend/src/utils/metrics.js
const client = require('prom-client');
const register = new client.Registry();

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

module.exports = { register, httpRequestDuration };
```

### Grafana (Optional)

Create dashboards in Grafana by importing metrics from the monitoring API.

## Alerts

Configure alerts for:
- High CPU usage (>80%)
- Low disk space (<10%)
- Failed transcoding
- High error rates

## Logs

Logs are stored in:
- `backend/logs/combined.log` - All logs
- `backend/logs/error.log` - Error logs only

Log format: JSON with timestamps

## Performance Optimization

Monitor these key metrics:
1. Response times
2. Database query times
3. Transcoding queue length
4. Active connections
5. Memory leaks

## Best Practices

1. Regular monitoring checks
2. Set up alerts for critical metrics
3. Archive old logs regularly
4. Monitor database performance
5. Track user activity patterns
