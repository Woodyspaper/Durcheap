#!/bin/bash

# Durcheap Mobile App Build and Submission Script
# Usage: ./scripts/build-and-submit.sh [ios|android|both]

set -e  # Exit on any error

PLATFORM=${1:-both}
PROJECT_DIR=$(dirname "$(dirname "$(realpath "$0")")")

echo "🚀 Starting Durcheap Mobile App Build Process"
echo "Platform: $PLATFORM"
echo "Project Directory: $PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Expo CLI is installed
    if ! command -v expo &> /dev/null; then
        print_error "Expo CLI not found. Install with: npm install -g @expo/cli"
        exit 1
    fi
    
    # Check if EAS CLI is installed
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI not found. Install with: npm install -g eas-cli"
        exit 1
    fi
    
    # Check if logged into EAS
    if ! eas whoami &> /dev/null; then
        print_warning "Not logged into EAS. Please run: eas login"
        eas login
    fi
    
    print_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    cd "$PROJECT_DIR"
    npm install
    print_success "Dependencies installed"
}

# Build for iOS
build_ios() {
    print_status "Building for iOS..."
    cd "$PROJECT_DIR"
    
    print_status "Creating iOS production build..."
    eas build --platform ios --non-interactive
    
    print_success "iOS build completed"
}

# Build for Android
build_android() {
    print_status "Building for Android..."
    cd "$PROJECT_DIR"
    
    print_status "Creating Android production build..."
    eas build --platform android --non-interactive
    
    print_success "Android build completed"
}

# Submit to App Store
submit_ios() {
    print_status "Submitting to App Store..."
    cd "$PROJECT_DIR"
    
    print_warning "Make sure you have completed App Store Connect setup"
    read -p "Continue with App Store submission? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas submit --platform ios --non-interactive
        print_success "iOS submission completed"
    else
        print_warning "iOS submission skipped"
    fi
}

# Submit to Google Play
submit_android() {
    print_status "Submitting to Google Play..."
    cd "$PROJECT_DIR"
    
    print_warning "Make sure you have completed Google Play Console setup"
    read -p "Continue with Google Play submission? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas submit --platform android --non-interactive
        print_success "Android submission completed"
    else
        print_warning "Android submission skipped"
    fi
}

# Pre-submission checklist
pre_submission_checklist() {
    print_status "Pre-submission checklist..."
    
    echo "📋 Please verify the following:"
    echo "   ✓ App Store Connect app created (iOS)"
    echo "   ✓ Google Play Console app created (Android)"
    echo "   ✓ App icons (1024x1024) ready"
    echo "   ✓ Screenshots prepared"
    echo "   ✓ App descriptions written"
    echo "   ✓ Privacy policy accessible"
    echo "   ✓ Terms of service ready"
    echo "   ✓ App tested on physical devices"
    echo "   ✓ All features working correctly"
    
    read -p "Have you completed all checklist items? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please complete checklist items before proceeding"
        print_status "Refer to store-assets/submission-checklist.md for details"
        exit 1
    fi
}

# Main execution
main() {
    print_status "Starting Durcheap Mobile App build and submission process"
    
    check_prerequisites
    install_dependencies
    pre_submission_checklist
    
    case $PLATFORM in
        ios)
            build_ios
            read -p "Submit to App Store? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                submit_ios
            fi
            ;;
        android)
            build_android
            read -p "Submit to Google Play? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                submit_android
            fi
            ;;
        both)
            build_ios
            build_android
            
            read -p "Submit to both stores? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                submit_ios
                submit_android
            fi
            ;;
        *)
            print_error "Invalid platform: $PLATFORM"
            print_status "Usage: $0 [ios|android|both]"
            exit 1
            ;;
    esac
    
    print_success "Build and submission process completed!"
    print_status "Monitor your app store consoles for review status"
}

# Run main function
main "$@"