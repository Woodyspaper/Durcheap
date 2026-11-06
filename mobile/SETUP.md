# Durcheap Mobile App Setup Guide

## Quick Start

### Prerequisites
1. **Node.js 18+** installed on your system
2. **Expo CLI** globally installed: `npm install -g @expo/cli`
3. **Expo Go app** on your phone (from App Store/Google Play)

### Development Setup

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**:
   ```bash
   expo start
   ```

4. **Test on your device**:
   - Open Expo Go app on your phone
   - Scan the QR code from the terminal/browser
   - App will load on your device

### Development Commands

```bash
# Start development server
expo start

# Start with specific platform
expo start --android
expo start --ios
expo start --web

# Clear cache and restart
expo start --clear

# Install new dependencies
npm install package-name --legacy-peer-deps
```

### Building for Production

```bash
# Build for Android (APK)
expo build:android

# Build for iOS (requires Apple Developer account)
expo build:ios

# Using EAS Build (recommended)
npm install -g @expo/eas-cli
eas build --platform android
eas build --platform ios
```

### Configuration

The app is configured to connect to your backend API:

- **Development**: `http://localhost:5000` (for simulators)
- **Production**: Update `src/config/api.ts` with your deployed URL

### Troubleshooting

**If you get dependency conflicts**:
```bash
npm install --legacy-peer-deps
```

**If Metro bundler fails**:
```bash
expo start --clear
```

**If app won't load on device**:
1. Ensure phone and computer are on same WiFi network
2. Check firewall settings
3. Try `expo start --tunnel`

### Next Steps

1. **Customize branding**: Update app.json with your app name, icons
2. **Add real images**: Replace placeholder assets in assets/ folder  
3. **Configure API**: Update API URL in src/config/api.ts
4. **Test thoroughly**: Test on both iOS and Android devices
5. **Deploy**: Build and submit to app stores

The mobile app shares the same backend as your web application, ensuring consistent data and user experience across all platforms.