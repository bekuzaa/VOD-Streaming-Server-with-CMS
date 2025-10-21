#!/bin/bash

echo "🎬 VOD Streaming Server - Setup Script"
echo "========================================"

# Create storage directories
echo "📁 Creating storage directories..."
mkdir -p ../storage/{videos,hls,temp}
touch ../storage/videos/.gitkeep
touch ../storage/hls/.gitkeep
touch ../storage/temp/.gitkeep

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f ../backend/.env ]; then
    cp ../backend/.env.example ../backend/.env
    echo "✅ Created backend/.env"
fi

if [ ! -f ../frontend/.env ]; then
    cp ../frontend/.env.example ../frontend/.env
    echo "✅ Created frontend/.env"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Start MongoDB and Redis"
echo "3. Run: npm run dev (in backend folder)"
echo "4. Run: npm start (in frontend folder)"
echo ""
echo "Or use Docker:"
echo "docker-compose up -d"
