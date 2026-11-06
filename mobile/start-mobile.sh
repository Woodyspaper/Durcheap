#!/bin/bash

echo "🚀 Starting Durcheap Mobile App Development"
echo "=========================================="
echo ""

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

# Navigate to mobile directory
cd "$(dirname "$0")"

echo "📱 Mobile App Directory: $(pwd)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing mobile app dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

echo "🎯 Development Options:"
echo "1. expo start          - Start development server"
echo "2. expo start --tunnel - Start with tunnel (for network issues)"
echo "3. expo start --web    - Start web version for browser testing"
echo ""

echo "📋 Next Steps:"
echo "1. Download 'Expo Go' app on your phone from App Store/Google Play"
echo "2. Run: expo start"
echo "3. Scan the QR code with Expo Go app"
echo "4. Your mobile app will load on your device!"
echo ""

echo "🌐 Backend API: The mobile app connects to http://localhost:5000"
echo "   Make sure your main web server is running for data to load."
echo ""

echo "Ready to start? Run one of these commands:"
echo "  expo start"
echo "  expo start --tunnel"
echo "  expo start --web"