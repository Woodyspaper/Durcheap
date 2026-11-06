# Durcheap E-commerce Application

## Overview
Durcheap is a full-stack e-commerce marketplace application providing a complete shopping experience with user authentication, product browsing, cart functionality, and role-based access for buyers, sellers, and administrators. It features a modern tech stack and aims to be a comprehensive marketplace for a wide range of products and services, including professional tools and contractor services. The project emphasizes a user-friendly design, robust backend functionality, and diversified revenue streams, including commission-based sales, seller subscriptions, and event marketing.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technologies
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query for server state, Context API for cart state, Radix UI components with shadcn/ui styling, Tailwind CSS, Vite.
- **Backend**: Express.js with TypeScript, Node.js (ESM modules), RESTful API, custom middleware.
- **Database**: Drizzle ORM, Neon serverless PostgreSQL, comprehensive e-commerce schema.
- **Authentication**: Replit Auth with OpenID Connect, Express sessions with PostgreSQL store (session cookies expire on browser close), role-based access control, two-factor authentication (TOTP, SMS, email, backup codes). All authentication redirects have been updated to use proper auth page (/auth) instead of OAuth endpoints (/api/login).

### Key Features
- **User Management**: Authentication with automatic logout on browser close, roles (buyer, seller, admin), profile management, comprehensive employee management system.
- **Product Catalog**: Categories (including multi-level subcategories), pricing, inventory, search, filtering (including location-based "Shop Local" and product condition).
- **Shopping & Orders**: Cart functionality, checkout, order processing, and tracking.
- **Reviews**: Product rating and review system.
- **Seller Tools**: Seller dashboard, product management (including bulk CSV import/export), shipping management (multi-carrier integration, label generation), tax document generation (1099-K, sales tax reports), accounting software integrations (QuickBooks, Xero, NetSuite, Sage Intacct, FreshBooks), contextual help system.
- **Admin Tools**: Employee access management, seller transition management, role-based access controls, product transfer capabilities.
- **Revenue Model**: Commission-based sales (tiered by category), tiered seller subscriptions (Basic, Pro, Enterprise), payment processing fees (NMI integration), event marketing services, professional services (Analytics Pro Suite, Business Verification, Accounting Integrations), premium buyer memberships (Durcheap Ultimate Rewards), and cryptocurrency conversion services (3.7% total fees including service, network/exchange, and compliance fees).
- **Marketing & Engagement**: Gamified reward points, animated product carousel, wishlist, voice search, social media sharing.
- **Internationalization**: Comprehensive multi-language support (12 languages) with RTL support and browser auto-detection.
- **Cryptocurrency Integration**: 17 supported cryptocurrencies with regional compliance tiers (Bitcoin, Ethereum, stablecoins, major altcoins including XRP), transparent fee structure (3.7% total), and regulatory compliance framework.
- **Mobile Application**: React Native with Expo for cross-platform (iOS/Android) deployment, offering a complete shopping and seller experience.

### UI/UX Design
- **Design System**: Custom Amazon-inspired theme with a consistent color palette.
- **Responsiveness**: Mobile-first design with adaptive layouts.
- **Components**: Reusable UI components built on Radix primitives.
- **Accessibility**: ARIA compliant components from Radix UI.
- **Dynamic Content**: Smart location display with geolocation detection, advanced event filtering and search.

### System Design Choices
- **Monorepo Structure**: Shared TypeScript types and schemas for type safety across the full stack.
- **Session Management**: Persistent user sessions stored in PostgreSQL.
- **Data Flow**: Structured authentication, product browsing, shopping cart, and order processing flows with clear API interactions.
- **Development & Production**: Separate configurations for development (hot reload, HMR) and production (bundled builds, static asset serving).

## External Dependencies

### Data & State Management
- `@neondatabase/serverless`: Neon PostgreSQL database connection
- `@tanstack/react-query`: Server state management
- `drizzle-orm`: TypeScript ORM and query builder

### Web & API Frameworks
- `express`: Web application framework
- `passport`: Authentication middleware
- `openid-client`: OpenID Connect authentication

### UI & Styling
- `@radix-ui/react-*`: Headless UI component primitives
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Component variant management
- `lucide-react`: Icon library

### Utilities & Tools
- `vite`: Build tool and development server
- `typescript`: Type checking and compilation
- `tsx`: TypeScript execution
- `esbuild`: Production bundling
- `papaparse`: CSV parsing and generation (for import/export)
- `multer`: Secure document upload

### Payment & Integrations
- NMI Payment Gateway (National Processing)
- OpenStreetMap Nominatim API (for reverse geocoding)
- Eventbrite, Meetup, Facebook Events, News APIs (for external event aggregation)