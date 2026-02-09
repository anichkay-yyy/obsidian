#!/bin/bash

# Development mode - runs backend and frontend dev server concurrently

set -e

echo "🔧 Starting Development Mode..."
echo ""

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
if [ ! -f "kb-server" ]; then
    echo "Building backend..."
    go build -o kb-server
fi

KB_VAULT_PATH=../vault KB_STATIC_DIR=../static ./kb-server &
BACKEND_PID=$!
cd ..

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "📍 API available at: http://localhost:33005/api"
echo ""

# Wait for backend to be ready
sleep 2

# Start frontend dev server
echo "🎨 Starting frontend dev server..."
cd frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
