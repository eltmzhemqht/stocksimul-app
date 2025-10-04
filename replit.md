# Overview

This is a mock stock trading platform (모의 주식 프로그램) that allows users to practice stock trading with virtual money. The application features a dark mode interface with deep navy aesthetics inspired by modern trading platforms like Robinhood and Webull. Users can view real-time stock prices, manage their portfolio, execute buy/sell trades, and track transaction history.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (alternative to React Router)

**UI Component System**
- shadcn/ui components built on Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows a dark mode theme with navy-black backgrounds and electric blue accents
- Custom color palette includes profit/loss indicators (green/red), with monospace fonts for financial data

**State Management**
- TanStack Query (React Query) for server state management and caching
- Custom query client configuration with disabled auto-refetching for optimal performance
- API request abstraction layer for consistent error handling

**Key Features**
- Dashboard page showing portfolio stats, holdings, and recent transactions
- Market page with stock listings and search functionality
- Stock detail pages with price charts and trade execution
- Transaction history tracking
- Real-time price visualization using Recharts

## Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- Custom Vite middleware integration for development hot reloading
- RESTful API design pattern

**API Endpoints**
- `/api/user` - User profile and balance management
- `/api/stocks` - Stock listings and individual stock details
- `/api/stocks/:id/history` - Historical price data for charting
- `/api/holdings` - User's current stock positions
- `/api/transactions` - Trade history
- `/api/portfolio/stats` - Aggregated portfolio statistics
- `/api/trade` - Execute buy/sell transactions

**Data Layer**
- Drizzle ORM for type-safe database queries and schema management
- PostgreSQL dialect configured (using @neondatabase/serverless driver)
- Schema includes: users, stocks, holdings, transactions, and price_history tables
- Zod integration for runtime validation via drizzle-zod

**Storage Abstraction**
- IStorage interface defining data access methods
- MemStorage implementation for in-memory data (development/testing)
- Designed for easy swapping to database-backed storage in production

## Database Schema

**Core Tables**
- `users` - User accounts with username, hashed password, and virtual cash balance (default ₩100,000)
- `stocks` - Stock information including symbol, name, current price, and previous close
- `holdings` - User's stock positions with quantity and average purchase price
- `transactions` - Complete trade history with type (buy/sell), quantity, price, and timestamp
- `price_history` - Time-series price data for chart generation

**Data Relationships**
- Holdings and transactions reference users and stocks via foreign key relationships
- Decimal precision used for financial values (15,2 for balances, 10,2 for prices)
- UUID primary keys for all tables

## External Dependencies

**UI Component Libraries**
- @radix-ui/* - Comprehensive suite of unstyled, accessible component primitives (accordion, dialog, dropdown, popover, etc.)
- cmdk - Command menu component
- embla-carousel-react - Touch-friendly carousel component
- recharts - Composable charting library for stock price visualization
- lucide-react - Icon library
- date-fns - Date formatting and manipulation

**Form & Validation**
- react-hook-form - Performant form state management
- @hookform/resolvers - Validation resolver integration
- zod - Schema validation library

**Styling**
- tailwindcss - Utility-first CSS framework
- tailwind-merge & clsx - Utility for merging Tailwind classes
- class-variance-authority - Type-safe variant styling
- Google Fonts (Inter, JetBrains Mono, Noto Sans KR) for typography

**Database & ORM**
- drizzle-orm - TypeScript ORM with zero runtime overhead
- drizzle-kit - Schema migrations and introspection tools
- @neondatabase/serverless - Serverless PostgreSQL driver
- drizzle-zod - Automatic Zod schema generation from Drizzle tables

**Development Tools**
- @replit/vite-plugin-* - Replit-specific Vite plugins for enhanced development experience
- tsx - TypeScript execution engine for development server
- esbuild - Fast JavaScript bundler for production builds

**Session Management**
- connect-pg-simple - PostgreSQL session store for Express sessions (configured but authentication not yet implemented)