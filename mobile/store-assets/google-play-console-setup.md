# Google Play Console Setup Guide

## Prerequisites
- Google Play Console developer account ($25 one-time registration fee)
- Google account with two-factor authentication
- Valid payment method for registration

## Step 1: Create New App

### App Details
1. Log into [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill out app details:
   - **App name**: Durcheap
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free

### Declarations
- [x] App complies with Google Play Developer Policy
- [x] App complies with US export laws
- [x] This app is mainly for children: No

## Step 2: App Signing

### Google Play App Signing (Recommended)
1. Go to Release → Setup → App signing
2. Choose "Google Play App Signing"
3. Upload signing key or let Google generate one
4. Download deployment certificate for EAS build

### Manual Signing (Alternative)
- Upload your own signing key
- Manage keystore manually
- Configure EAS with keystore credentials

## Step 3: Store Listing

### Main Store Listing

#### App Details
- **App name**: Durcheap
- **Short description** (80 characters):
```
Community marketplace with local shopping, event marketing, and seller tools
```

- **Full description** (4000 characters):
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

💼 Business Solutions
• Tax compliance and automated reporting
• Multi-channel shipping tools
• Commission tracking and referral program
• Enterprise white-label marketplace options

WHY CHOOSE DURCHEAP?
• Lower fees than major competitors (5-15% vs 15-20%)
• Advanced local marketplace features
• Comprehensive seller support and tools
• Event marketing integration for community building
• Mobile-optimized experience with native performance

Perfect for individual sellers, small businesses, and enterprises looking for a modern marketplace platform with advanced marketing capabilities and local community focus.

Download Durcheap today and join the future of community-driven commerce!
```

#### Graphics
- **App icon**: 512 x 512 pixels (high-res PNG)
- **Feature graphic**: 1024 x 500 pixels
- **Phone screenshots**: Minimum 1080 x 1920 pixels
- **7-inch tablet screenshots**: Optional but recommended
- **10-inch tablet screenshots**: Optional but recommended

#### Categorization
- **Category**: Shopping
- **Tags**: marketplace, local business, ecommerce, events, community

#### Contact Details
- **Website**: https://durcheap.com
- **Email**: support@durcheap.com
- **Phone**: +1 (954) 937-5374
- **Privacy Policy**: https://durcheap.com/privacy

## Step 4: Content Rating

### Content Rating Questionnaire

#### Violence and Gore
- Does your app contain violence?: No
- Does your app contain blood?: No

#### Sexual Content
- Does your app contain sexual themes?: No
- Does your app contain nudity?: No

#### Profanity
- Does your app contain profanity?: No

#### Drugs and Alcohol
- Does your app contain drug or alcohol references?: No

#### Gambling and Contests
- Does your app contain gambling content?: No
- Does your app contain contests?: No

#### User-Generated Content
- Does your app allow users to create content?: Yes
- What type?: Product reviews, seller profiles, event listings
- Is content moderated?: Yes
- Can users contact each other?: Through the platform (seller-buyer communication)

#### Location Sharing
- Does your app allow location sharing?: Yes
- Purpose: Local marketplace features, delivery options

**Rating Result**: Everyone (suitable for all ages)

## Step 5: Data Safety

### Data Collection
See detailed data safety form in `data-safety-form.md`

#### Summary
- **Personal Info**: Email, name, user IDs
- **Financial Info**: Payment details, purchase history
- **Location**: Approximate location for local features
- **Photos**: Product images, profile pictures (optional)
- **Audio**: Voice search (optional)
- **App Activity**: Usage analytics, search history

#### Data Sharing
- Payment processors for transactions
- Shipping partners for fulfillment
- Analytics services for app improvement
- No data selling to third parties

#### Security
- Data encrypted in transit and at rest
- Industry-standard security practices
- User control over data deletion

## Step 6: App Access

### Target Audience
- **Target age range**: 18 and older (marketplace transactions)
- **Appeal to children**: No
- **Known appeal to children**: No

### News Apps (if applicable)
- Not applicable for marketplace app

## Step 7: Government Apps
- Not applicable for commercial marketplace

## Step 8: Financial Features
- **Contains ads**: No
- **Contains in-app purchases**: No (free marketplace usage)
- **Offers paid subscription**: Yes (seller subscription plans)

## Step 9: Release Management

### Production Release

#### Release Overview
1. Go to Release → Production
2. Click "Create new release"
3. Upload app bundle (AAB file from EAS build)
4. Add release notes

#### Release Notes Template
```
Version 1.0.0 - Initial Release

🎉 Welcome to Durcheap - Your Local Marketplace!

NEW FEATURES:
• Complete marketplace experience with secure shopping
• Shop Local feature for community-focused commerce
• Advanced seller dashboard and product management
• Event marketing platform for local businesses
• Location-based recommendations and delivery
• Professional business verification system

WHAT'S INCLUDED:
• Browse products across 7 major categories
• Secure cart and checkout process
• Real-time order tracking
• Seller analytics and insights
• Tax compliance tools
• Multi-channel shipping integration

Join thousands of sellers and buyers building stronger local communities through commerce. Download Durcheap and start shopping local today!

For support: support@durcheap.com
```

#### Countries/Regions
- **Availability**: All countries (or select specific regions)
- **Restrictions**: None (unless required by local laws)

## Step 10: App Bundle Upload

### Using EAS Build
```bash
# Build for Google Play Store
eas build --platform android --profile production-store

# This creates an AAB (Android App Bundle) file
# Upload the AAB to Google Play Console
```

### Manual Upload Process
1. Go to Release → Production → Create new release
2. Upload app bundle (AAB file)
3. Review app signing information
4. Add release notes
5. Review and rollout

## Step 11: Review and Release

### Pre-submission Checklist
- [x] Store listing completed
- [x] Content rating assigned
- [x] Data safety form completed
- [x] App access information provided
- [x] App bundle uploaded
- [x] Release notes added
- [x] Privacy policy accessible
- [x] All required graphics uploaded

### Submission Process
1. Review all sections for completeness
2. Click "Review release"
3. Address any policy warnings
4. Click "Start rollout to production"

### Rollout Options
- **Staged rollout**: 1%, 5%, 10%, 20%, 50%, 100%
- **Full rollout**: 100% immediately
- **Halted rollout**: Pause if issues arise

## Step 12: Post-Release Management

### Release Timeline
- **Processing time**: 3-7 days for initial review
- **Updates**: Usually approved within 24 hours
- **Policy violations**: Immediate suspension possible

### Monitoring
- **Play Console**: Monitor crashes, ANRs, reviews
- **Google Analytics**: Track downloads and user behavior
- **User feedback**: Respond to reviews promptly

### Update Process
1. Increment version code in app.json
2. Build new AAB with EAS
3. Upload to existing app in Play Console
4. Add release notes for changes
5. Rollout to production

## Step 13: Common Issues and Solutions

### Upload Issues
- **Bundle size**: Optimize assets if over 150MB
- **Permissions**: Justify all requested permissions
- **Target SDK**: Must target recent Android API level

### Policy Violations
- **Content policy**: Ensure no prohibited content
- **Privacy policy**: Must be accessible and compliant
- **Permissions**: Only request necessary permissions

### Post-Launch
- **Crashes**: Monitor and fix crashes quickly
- **Reviews**: Respond to user feedback
- **Updates**: Regular updates improve ranking

## Support Resources
- **Google Play Console Help**: support.google.com/googleplay/android-developer
- **Policy Center**: play.google.com/about/developer-content-policy
- **Developer Guidelines**: developer.android.com/distribute/google-play