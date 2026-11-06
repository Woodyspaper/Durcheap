#!/bin/bash

# Durcheap Mobile App Deployment Script

echo "🚀 Starting Durcheap Mobile App Deployment..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if logged into Expo
echo "🔐 Checking Expo authentication..."
if ! eas whoami &> /dev/null; then
    echo "Please login to Expo:"
    eas login
fi

# Validate app configuration
echo "✅ Validating app configuration..."
if [ ! -f "app.json" ]; then
    echo "❌ app.json not found!"
    exit 1
fi

if [ ! -f "eas.json" ]; then
    echo "❌ eas.json not found!"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Initialize EAS project if needed
if ! grep -q "projectId" app.json; then
    echo "🏗️ Initializing EAS project..."
    eas init
fi

# Build options
echo "📱 Select build type:"
echo "1. Android only"
echo "2. iOS only"
echo "3. Both platforms"
echo "4. Preview build (internal testing)"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🤖 Building for Android..."
        eas build --platform android --profile production
        ;;
    2)
        echo "🍎 Building for iOS..."
        eas build --platform ios --profile production
        ;;
    3)
        echo "📱 Building for both platforms..."
        eas build --platform all --profile production
        ;;
    4)
        echo "👀 Building preview version..."
        eas build --platform all --profile preview
        ;;
    *)
        echo "❌ Invalid option. Exiting..."
        exit 1
        ;;
esac

echo "✅ Build initiated! Check your Expo dashboard for progress."
echo "📧 You'll receive an email when the build is complete."

# Optional: Submit to stores
read -p "🏪 Would you like to submit to app stores after build completes? (y/n): " submit

if [ "$submit" = "y" ] || [ "$submit" = "Y" ]; then
    echo "📝 Note: Make sure you have:"
    echo "   • Apple Developer account (for iOS)"
    echo "   • Google Play Console account (for Android)"
    echo "   • App Store Connect app created (for iOS)"
    echo "   • Google Play Console app created (for Android)"
    echo ""
    echo "🚀 To submit after build completes, run:"
    echo "   eas submit --platform android  # For Google Play"
    echo "   eas submit --platform ios      # For App Store"
fi

echo "🎉 Deployment process initiated successfully!"
echo "📖 Check APP_STORE_DEPLOYMENT.md for detailed instructions."