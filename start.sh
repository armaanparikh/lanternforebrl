#!/bin/bash

# EBRL Transcription Pipeline - Single Startup Script
# Starts both backend and frontend in one command

echo "====================================="
echo "EBRL Transcription Pipeline"
echo "====================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18 or higher"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  Warning: ffmpeg is not installed"
    echo "Whisper requires ffmpeg to process audio files"
    echo ""
    echo "Install ffmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill 0
    exit
}

trap cleanup SIGINT SIGTERM

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Setup backend
cd backend

# Install Python dependencies if needed
if [ ! -f ".requirements_installed" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install flask flask-cors pandas numpy werkzeug openai-whisper
    touch .requirements_installed
else
    echo "✅ Python dependencies already installed"
fi

cd ..

echo ""
echo "✅ Dependencies ready!"
echo ""
echo "🚀 Starting servers..."
echo ""
echo "   Backend:  http://127.0.0.1:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""
echo "─────────────────────────────────────"
echo ""

# Start backend in background
cd backend
python3 server.py &
BACKEND_PID=$!
cd ..

# Give backend a moment to start
sleep 2

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait
