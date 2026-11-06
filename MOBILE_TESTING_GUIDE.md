# Durcheap Mobile App Testing Guide

## Overview
The Durcheap mobile app is a complete React Native application built with Expo that provides the full marketplace experience on iOS and Android devices. It shares the same backend API as the web application, ensuring consistent data across platforms.

## Mobile App Features

### ✅ Core Features Implemented
- **Tab-based Navigation**: Home, Categories, Cart, Profile
- **Product Browsing**: Browse categories and featured products
- **Product Details**: Full product information with images and reviews
- **Shopping Cart**: Add/remove items, quantity management
- **User Authentication**: Secure login with token storage
- **Search Functionality**: Find products by name or category
- **Seller Dashboard**: Mobile-friendly seller tools
- **Profile Management**: User account and order history

### 📱 Mobile-Specific Features
- **Native Navigation**: Smooth stack and tab navigation
- **Touch Optimized**: Gesture-friendly interface
- **Offline Capability**: React Query caching for better performance
- **Cross-Platform**: Single codebase for iOS and Android
- **Secure Storage**: Encrypted token storage with Expo Secure Store

## Testing Instructions

### Prerequisites
1. **Install Expo CLI globally**:
   ```bash
   npm install -g @expo/cli
   ```

2. **Install Expo Go app** on your phone:
   - iOS: Download from App Store
   - Android: Download from Google Play Store

### Testing Steps

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**:
   ```bash
   expo start
   ```

4. **Test on your device**:
   - Open Expo Go app on your phone
   - Scan the QR code displayed in terminal/browser
   - App will load on your device

### Testing Checklist

#### 🏠 Home Screen
- [ ] Category grid displays correctly
- [ ] Featured products carousel works
- [ ] Search bar is functional
- [ ] Navigation to product details works

#### 📂 Categories Screen
- [ ] All categories display with images
- [ ] Tapping category filters products
- [ ] Product grid layout is responsive

#### 🛒 Cart Screen
- [ ] Add/remove items works
- [ ] Quantity adjustment functions
- [ ] Total calculation is accurate
- [ ] Checkout navigation works

#### 👤 Profile Screen
- [ ] User information displays
- [ ] Login/logout functionality
- [ ] Order history accessible
- [ ] Settings and preferences work

#### 🔍 Search Screen
- [ ] Search input responds to typing
- [ ] Results display correctly
- [ ] Filters and sorting work

#### 🏪 Seller Dashboard (if seller role)
- [ ] Product management works
- [ ] Add/edit products functional
- [ ] Analytics and stats display
- [ ] Order management accessible

### Performance Testing

#### Network Conditions
- Test with good WiFi connection
- Test with mobile data
- Test with poor/intermittent connection
- Verify offline functionality

#### Device Testing
- Test on different screen sizes
- Test on iOS and Android
- Test on different OS versions
- Verify touch responsiveness

## Expected User Experience

### First Launch
1. User sees welcome screen
2. Navigation tabs are clearly visible
3. Home screen loads featured products
4. Search and categories are accessible

### Shopping Flow
1. Browse categories or search products
2. View product details with images
3. Add items to cart with quantity
4. Review cart and proceed to checkout
5. Complete order (mock payment for testing)

### Seller Experience
1. Login with seller account
2. Access seller dashboard
3. Manage products and inventory
4. View sales analytics
5. Process orders

## Troubleshooting

### Common Issues

**App won't load on device**:
- Ensure phone and computer are on same WiFi network
- Check firewall settings
- Try `expo start --tunnel`

**Dependencies not installing**:
```bash
npm install --legacy-peer-deps
npm cache clean --force
```

**Metro bundler errors**:
```bash
expo start --clear
```

**Authentication not working**:
- Check backend server is running on correct port
- Verify API URL in `src/config/api.ts`
- Check network connectivity

### Debug Information

The mobile app connects to your backend at:
- **Local Development**: `http://localhost:5000`
- **Network Testing**: Update API URL for device testing

### Production Deployment

When ready for app store deployment:

1. **Configure app.json** with your branding
2. **Build with EAS**:
   ```bash
   npm install -g @expo/eas-cli
   eas build --platform android
   eas build --platform ios
   ```
3. **Submit to stores** using EAS Submit

## Technical Architecture

### Technology Stack
- **React Native**: Cross-platform mobile framework
- **Expo**: Development and deployment platform
- **React Navigation**: Native navigation
- **TanStack Query**: Server state management
- **Expo Secure Store**: Encrypted storage
- **TypeScript**: Type safety

### API Integration
- Shares same REST API as web application
- Consistent data models and responses
- Authentication via JWT tokens
- Real-time updates through React Query

The mobile app provides a complete native experience while maintaining consistency with your web platform.