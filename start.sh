#!/bin/bash

# Knowledge Base Startup Script

set -e

echo "🚀 Starting Knowledge Base..."
echo ""

# Check if backend binary exists
if [ ! -f "backend/kb-server" ]; then
    echo "📦 Building backend..."
    cd backend
    go build -o kb-server
    cd ..
    echo "✅ Backend built successfully"
fi

# Check if frontend is built
if [ ! -d "static" ] || [ ! -f "static/index.html" ]; then
    echo "📦 Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    cp -r frontend/dist static
    echo "✅ Frontend built successfully"
fi

echo ""
echo "✨ Starting server..."
echo "📍 Server will be available at: http://localhost:33005"
echo "🔐 Default credentials: admin / changeme"
echo ""

# Set environment variables
export KB_VAULT_PATH=${KB_VAULT_PATH:-./vault}
export KB_STATIC_DIR=${KB_STATIC_DIR:-./static}
export KB_PORT=${KB_PORT:-33005}
export KB_AUTH_USER=${KB_AUTH_USER:-admin}
export KB_AUTH_PASS=${KB_AUTH_PASS:-changeme}

# Start server
cd backend
./kb-server
