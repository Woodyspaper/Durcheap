# App Store Connect Setup Guide

## Prerequisites
- Apple Developer Program membership ($99/year)
- Verified Apple ID with two-factor authentication
- Tax and banking information completed in App Store Connect

## Step 1: Create New App

### Basic App Information
1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill out app details:
   - **Platforms**: iOS
   - **Name**: Durcheap
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.durcheap.mobile (must match app.json)
   - **SKU**: durcheap-mobile-2024 (unique identifier)

### App Information Tab
- **Name**: Durcheap
- **Subtitle**: Local Marketplace & Events
- **Category**: Shopping
- **Secondary Category**: Business
- **Content Rights**: No, it does not contain, show, or access third-party content

## Step 2: Pricing and Availability

### Pricing
- **Price**: Free
- **Availability**: All countries/regions
- **Release Date**: Manual release after approval

### App Store Localizations
- **Primary**: English (U.S.)
- **Additional**: Spanish, French, German (optional)

## Step 3: App Information Details

### General App Information
- **App Store Icon**: 1024x1024 PNG (upload from assets/icon.png)
- **App Previews**: Optional 15-30 second videos
- **Screenshots**: 
  - iPhone 6.7" Display: 1290 x 2796 pixels (required)
  - iPhone 6.5" Display: 1242 x 2688 pixels (optional)
  - iPad Pro (3rd Gen): 2048 x 2732 pixels (if supporting iPad)

### Description
```
Durcheap is the comprehensive marketplace platform that connects buyers and sellers while empowering local businesses with powerful event marketing and discovery tools.

KEY FEATURES:
🛒 Complete Marketplace Experience
• Browse thousands of products across 7 major categories
• Secure shopping cart and checkout process
• Real-time order tracking and management
• Professional seller dashboard and tools

🌍 Shop Local Priority
• Location-based product and seller discovery
• Priority local delivery options
• Support community businesses in your area
• Geolocation-based recommendations

📈 Advanced Seller Tools
• Comprehensive product management
• Real-time analytics and insights
• Bulk import/export capabilities
• Professional business verification

🎯 Event Marketing Platform
• Create and promote local events
• Geographic targeting and audience reach
• Event analytics and performance tracking
• Subscription-based marketing plans

WHY CHOOSE DURCHEAP?
• Lower fees than major competitors (5-15% vs 15-20%)
• Advanced local marketplace features
• Comprehensive seller support and tools
• Event marketing integration for community building
• Mobile-optimized experience with native performance

Perfect for individual sellers, small businesses, and enterprises looking for a modern marketplace platform with advanced marketing capabilities and local community focus.

Download Durcheap today and join the future of community-driven commerce!
```

### Keywords
```
marketplace,local,shop,sell,business,events,marketing,ecommerce,community,mobile
```

### Support URL
```
https://help.durcheap.com
```

### Marketing URL
```
https://durcheap.com
```

### Privacy Policy URL
```
https://durcheap.com/privacy
```

## Step 4: Age Rating

### Apple's Age Rating Questionnaire
- **Cartoon or Fantasy Violence**: No
- **Realistic Violence**: No
- **Sexual Content or Nudity**: No
- **Profanity or Crude Humor**: No
- **Alcohol, Tobacco, or Drug Use**: No
- **Mature/Suggestive Themes**: No
- **Horror/Fear Themes**: No
- **Medical/Treatment Information**: No
- **Gambling**: No
- **Contests**: No
- **Unfiltered Web Access**: No
- **User Generated Content**: Yes (product reviews, seller profiles)
- **Location Services**: Yes (for local marketplace features)
- **Social Networking**: No
- **Mobile Data Plan**: No

**Result**: Rated 4+ (No Objectionable Content)

## Step 5: App Review Information

### Contact Information
- **First Name**: Support
- **Last Name**: Team
- **Phone Number**: +1 (954) 937-5374
- **Email**: support@durcheap.com

### Demo Account (if needed)
- **Username**: demo@durcheap.com
- **Password**: DemoPass2024!
- **Additional Notes**: Demo account includes sample products and events for review purposes. App can be fully tested without authentication for basic browsing.

### Review Notes
```
Durcheap is a marketplace app that connects buyers and sellers with local focus. Key features for review:

1. BROWSING: App loads to home screen showing categories and products - no login required
2. AUTHENTICATION: Uses Replit OAuth for secure user authentication
3. SHOPPING: Users can browse products, add to cart, and checkout securely
4. LOCAL FEATURES: Location services show nearby sellers and local delivery options
5. SELLER TOOLS: Comprehensive dashboard for product management and analytics
6. EVENT MARKETING: Integrated event promotion platform for local businesses

The app requires location permissions to provide local marketplace features but functions without them. Camera and microphone permissions are for optional features (profile photos, voice search).

Please test the demo account or create a new account for full functionality review.
```

## Step 6: Build Upload

### Using EAS Build
```bash
# Build for iOS App Store
eas build --platform ios --profile production-store

# The build will be automatically uploaded to App Store Connect
# when complete, find it under TestFlight → iOS Builds
```

### Manual Xcode Upload (Alternative)
1. Download .ipa file from EAS Build
2. Use Xcode → Window → Organizer
3. Upload to App Store Connect

## Step 7: Release Preparation

### Version Release
1. Go to App Store Connect → Your App → Version
2. Select the uploaded build
3. Complete all required fields
4. Submit for Review

### Release Options
- **Manual Release**: Control exact release timing
- **Automatic Release**: Release immediately after approval
- **Scheduled Release**: Release on specific date

## Step 8: Submission Checklist

### Required Items
- [x] App metadata completed
- [x] Screenshots uploaded (all required sizes)
- [x] App icon uploaded (1024x1024)
- [x] Age rating completed
- [x] Pricing set to Free
- [x] Build uploaded and selected
- [x] Review information provided
- [x] Privacy policy accessible
- [x] Support URL functional

### Final Submission
1. Review all information for accuracy
2. Click "Submit for Review"
3. Monitor review status in App Store Connect
4. Respond to any reviewer questions promptly

## Post-Submission

### Review Timeline
- **Typical Review Time**: 24-48 hours
- **Maximum Review Time**: 7 days
- **Holiday Delays**: May take longer during major holidays

### Review Status Tracking
- **In Review**: Apple is actively reviewing
- **Pending Developer Release**: Approved, waiting for manual release
- **Ready for Sale**: Live in App Store
- **Rejected**: Address issues and resubmit

### Common Rejection Reasons
1. App crashes or doesn't work as described
2. Missing or incorrect metadata
3. Privacy policy issues
4. Guideline violations
5. Incomplete functionality

### After Approval
1. App appears in App Store within 24 hours
2. Monitor App Analytics for downloads and usage
3. Respond to user reviews promptly
4. Plan marketing and promotion campaigns