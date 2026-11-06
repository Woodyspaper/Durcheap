# Durcheap Mobile App

A React Native mobile application for the Durcheap e-commerce marketplace, built with Expo for cross-platform deployment to iOS and Android.

## Features

### Core Functionality
- **Browse Products**: Discover products by category with search functionality
- **Product Details**: View detailed product information, images, and reviews
- **Shopping Cart**: Add items to cart and manage quantities
- **User Authentication**: Sign in with Replit Auth integration
- **Seller Tools**: Complete seller dashboard and product management

### Mobile-Optimized Experience
- **Native Navigation**: Smooth tab-based and stack navigation
- **Touch-Friendly UI**: Optimized for mobile interactions
- **Offline Capability**: React Query caching for improved performance
- **Push Notifications**: Ready for order updates and promotions

## Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe development
- **React Navigation**: Native navigation patterns
- **TanStack Query**: Server state management and caching
- **Expo Secure Store**: Secure token storage
- **Vector Icons**: Consistent iconography

## Development Setup

### Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (for testing)

### Installation
```bash
cd mobile
npm install
```

### Development
```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web (for testing)
npm run web
```

### Testing
1. Install Expo Go on your phone from the App Store/Play Store
2. Scan the QR code from the Expo development server
3. The app will load on your device for real-time testing

## Project Structure

```
mobile/
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/           # Screen components
│   ├── contexts/          # React context providers
│   ├── config/            # App configuration
│   └── types/             # TypeScript type definitions
├── assets/                # Images, fonts, and static assets
├── App.tsx               # Main app component and navigation
├── app.json              # Expo configuration
└── package.json          # Dependencies and scripts
```

## API Integration

The mobile app connects to the same backend API as the web application:

- **Development**: Configure your Replit domain in `src/config/api.ts`
- **Production**: Update API_BASE_URL for your deployed backend
- **Authentication**: Uses Replit Auth with secure token storage

## Build and Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
# Android App Bundle for Google Play
eas build --platform android

# iOS App for App Store
eas build --platform ios
```

### App Store Submission
1. **iOS**: Build and submit through Expo Application Services (EAS)
2. **Android**: Generate signed APK/AAB and upload to Google Play Console

## Key Features

### Shopping Experience
- **Product Catalog**: Browse by categories with filtering and search
- **Product Details**: High-quality images, specifications, and reviews
- **Cart Management**: Add, remove, and update quantities
- **Checkout Process**: Secure payment integration (ready for implementation)

### Seller Features
- **Dashboard**: Overview of products, orders, and sales analytics
- **Product Management**: Add, edit, and delete products
- **Order Tracking**: Monitor and fulfill customer orders
- **Analytics**: Sales performance and insights

### User Account
- **Profile Management**: View and edit user information
- **Order History**: Track past purchases and order status
- **Wishlist**: Save products for later purchase
- **Settings**: App preferences and account settings

## Configuration

### Environment Variables
Update `src/config/api.ts` with your backend URL:

```typescript
const API_BASE_URL = 'https://your-domain.replit.app';
```

### App Configuration
Modify `app.json` for:
- App name and description
- Bundle identifiers for iOS/Android
- Icon and splash screen assets
- Permissions and capabilities

## Performance Optimization

- **React Query**: Intelligent caching and background updates
- **Image Optimization**: Lazy loading and caching
- **Bundle Splitting**: Optimized JavaScript bundles
- **Native Performance**: Hardware-accelerated navigation and animations

## Security

- **Secure Storage**: User tokens encrypted with Expo Secure Store
- **API Security**: HTTPS communication with backend
- **Authentication**: Secure OAuth flow with Replit
- **Data Validation**: Input sanitization and validation

## Future Enhancements

- **Push Notifications**: Order updates and promotional messages
- **Offline Mode**: Browse products without internet connection
- **Barcode Scanner**: Quick product lookup and inventory management
- **Social Features**: Product sharing and reviews
- **Payment Integration**: Stripe, PayPal, and other payment providers

## Support

For technical support or questions about the mobile app:
1. Check the React Native and Expo documentation
2. Review the API integration guide
3. Test on both iOS and Android devices
4. Validate with real backend data

The mobile app provides a complete e-commerce experience optimized for iOS and Android devices, with seamless integration to the Durcheap backend API.