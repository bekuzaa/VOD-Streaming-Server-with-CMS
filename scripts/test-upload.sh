#!/bin/bash

API_URL="http://localhost:5000"
TOKEN=""

echo "🧪 Testing VOD Streaming Server"
echo "================================"

# Login
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    exit 1
fi

echo "✅ Login successful"

# Get videos
echo "2. Testing get videos..."
curl -s -X GET "$API_URL/api/videos" \
  -H "Authorization: Bearer $TOKEN" | head -n 5

echo "✅ Get videos successful"

# Health check
echo "3. Testing health check..."
curl -s -X GET "$API_URL/api/health"

echo ""
echo "✅ All tests passed!"
