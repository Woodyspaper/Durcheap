# Durcheap Mobile App Store Deployment Guide

## Overview
This guide will walk you through deploying the Durcheap mobile app to both Apple App Store and Google Play Store using Expo Application Services (EAS).

## Prerequisites

### Required Accounts
1. **Expo Account**: Sign up at https://expo.dev
2. **Apple Developer Account**: $99/year at https://developer.apple.com (for iOS)
3. **Google Play Console Account**: $25 one-time fee at https://play.google.com/console (for Android)

### Required Tools
```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Install Expo CLI globally
npm install -g @expo/cli
```

## Step-by-Step Deployment

### 1. Initial Setup

1. **Login to Expo**:
   ```bash
   cd mobile
   eas login
   ```

2. **Initialize EAS Project**:
   ```bash
   eas init
   ```
   This will create an EAS project and update your app.json with a project ID.

3. **Configure app.json** (update these values):
   ```json
   {
     "expo": {
       "name": "Durcheap",
       "slug": "durcheap-mobile",
       "version": "1.0.0",
       "ios": {
         "bundleIdentifier": "com.yourcompany.durcheap",
         "buildNumber": "1"
       },
       "android": {
         "package": "com.yourcompany.durcheap",
         "versionCode": 1
       },
       "owner": "your-expo-username"
     }
   }
   ```

### 2. App Store Assets

Create the following assets in the `mobile/assets/` folder:

#### App Icons
- **icon.png**: 1024x1024px app icon
- **adaptive-icon.png**: 1024x1024px (Android adaptive icon foreground)

#### Splash Screen
- **splash.png**: 1284x2778px splash screen image

#### Store Listings
Prepare these for store submissions:
- App description (short and long)
- Keywords for search optimization
- Screenshots for different device sizes
- App preview videos (optional but recommended)

### 3. Production API Configuration

Update the API configuration for production:

**mobile/src/config/api.ts**:
```typescript
const getApiUrl = () => {
  if (__DEV__) {
    return 'http://localhost:5000'; // Development
  }
  return 'https://your-production-domain.com'; // Your deployed backend
};
```

### 4. Build for App Stores

#### Android Build (Google Play Store)

1. **Build APK/AAB**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Download the build** when complete (you'll get a notification)

3. **Test the build** on a physical Android device before submission

#### iOS Build (Apple App Store)

1. **Build IPA**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **The build will be automatically uploaded** to App Store Connect (if configured)

### 5. Store Submissions

#### Google Play Store Submission

1. **Go to Google Play Console**: https://play.google.com/console
2. **Create new app** or select existing app
3. **Upload your AAB file** in the Production track
4. **Fill out store listing**:
   - App name: "Durcheap"
   - Short description: "Complete marketplace for buying and selling"
   - Full description: Detailed description of features
   - Screenshots: Upload screenshots for phone and tablet
   - Category: Shopping
   - Content rating: Complete questionnaire
5. **Set up pricing**: Free or paid
6. **Submit for review**

#### Apple App Store Submission

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Create new app** or select existing app
3. **App information**:
   - Name: "Durcheap"
   - Bundle ID: Match your app.json bundleIdentifier
   - SKU: Unique identifier
   - Primary language: English
4. **App Store listing**:
   - Description: Detailed app description
   - Keywords: Relevant search keywords
   - Screenshots: Required for all supported devices
   - App preview: Video demonstrations (optional)
5. **Pricing and availability**: Set pricing and regions
6. **Submit for review**

### 6. Automated Submission (Optional)

Use EAS Submit for automated store submissions:

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

## Production Checklist

### Before Building
- [ ] Update app version in app.json
- [ ] Configure production API URLs
- [ ] Test app thoroughly on physical devices
- [ ] Prepare all required app store assets
- [ ] Write compelling app descriptions
- [ ] Take high-quality screenshots

### Store Compliance
- [ ] Privacy policy URL (required)
- [ ] Terms of service (recommended)
- [ ] Content rating appropriate for app
- [ ] App follows store guidelines
- [ ] No test/placeholder content

### Technical Requirements
- [ ] App works offline (at least basic functionality)
- [ ] Handles network errors gracefully
- [ ] Follows platform design guidelines
- [ ] Optimized performance and loading times
- [ ] Secure authentication implementation

## Timeline Expectations

### Google Play Store
- **Review time**: 1-3 days typically
- **Faster process**: Usually approved quickly for well-prepared apps

### Apple App Store
- **Review time**: 24-48 hours typically
- **More strict**: Higher chance of rejection for guideline violations
- **Appeals process**: Available if rejected

## Post-Launch

### Analytics and Monitoring
- Set up app analytics (Expo Analytics or Firebase)
- Monitor crash reports and user feedback
- Track download and engagement metrics

### Updates and Maintenance
```bash
# For app updates, increment version and build:
# In app.json: version: "1.0.1", buildNumber: "2", versionCode: 2
eas build --platform all --profile production
```

### Marketing
- App Store Optimization (ASO)
- Social media promotion
- Website integration with app download links
- User feedback collection and responses

## Troubleshooting

### Common Build Issues
- **Certificate errors**: Ensure Apple Developer account is properly configured
- **Bundle ID conflicts**: Use unique bundle identifiers
- **Asset issues**: Verify all required images are properly sized

### Common Rejection Reasons
- Missing or incorrect app icons
- Placeholder content in screenshots
- App crashes on launch
- Missing privacy policy for apps that collect data
- Violating platform-specific guidelines

## Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Guide**: https://docs.expo.dev/build/introduction/
- **Apple Guidelines**: https://developer.apple.com/app-store/guidelines/
- **Google Guidelines**: https://support.google.com/googleplay/android-developer/

Your Durcheap mobile app is production-ready and configured for deployment to both app stores!