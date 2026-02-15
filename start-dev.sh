#!/bin/bash

# TakeItFree Development Startup Script
# This script starts both the backend server and Expo development server

set -e

echo "================================"
echo "TakeItFree Development Startup"
echo "================================"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "================================"
echo "Starting Backend Server..."
echo "================================"
echo "Run in Terminal 1:"
echo "npm run server:dev"
echo ""
echo "This will start the backend on http://localhost:5000"
echo ""

echo "================================"
echo "In a separate terminal, start Expo:"
echo "================================"
echo "Run in Terminal 2:"
echo "npm run expo:dev"
echo ""
echo "This will start the mobile/web development server"
echo ""

echo "================================"
echo "Quick Startup Commands:"
echo "================================"
echo ""
echo "Terminal 1 (Backend):"
echo "  npm run server:dev"
echo ""
echo "Terminal 2 (Mobile/Web):"
echo "  npm run expo:dev"
echo ""
echo "Test the API is working:"
echo "  curl http://localhost:5000/api/health"
echo ""
echo "Expected response:"
echo "  {\"status\":\"ok\",\"message\":\"TakeItFree API is running\"}"
echo ""

echo "================================"
echo "Setup Instructions:"
echo "================================"
echo ""
echo "1. Make sure you have two terminal windows open"
echo "2. Copy .env.example to .env.local"
echo "3. Set DATABASE_URL in .env.local"
echo "4. Run migrations: npm run db:push"
echo "5. Start backend: npm run server:dev (Terminal 1)"
echo "6. Start expo: npm run expo:dev (Terminal 2)"
echo ""
echo "Check SIGNUP_ERROR_FIX.md for detailed troubleshooting"
echo ""
