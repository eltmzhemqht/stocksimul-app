# Design Guidelines: Mock Stock Trading Platform (모의 주식 프로그램)

## Design Approach
**Reference-Based Approach** drawing from modern trading platforms (Robinhood, Webull, Bloomberg) adapted to the specified black & deep navy aesthetic. The design prioritizes data clarity, real-time information hierarchy, and confident trading actions within a premium dark interface.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background Base: 220 25% 8% (Deep navy-black)
- Surface Layer: 220 20% 12% (Elevated navy)
- Card/Component: 220 18% 15% (Navy surface)
- Border Subtle: 220 15% 20% (Navy border)

**Accent Colors**
- Success/Profit: 142 76% 45% (Vibrant green for gains)
- Danger/Loss: 0 72% 55% (Sharp red for losses)
- Primary Action: 217 91% 60% (Electric blue for CTAs)
- Info/Neutral: 220 12% 60% (Muted blue-gray)

**Text Hierarchy**
- Primary Text: 220 15% 95% (Near white)
- Secondary Text: 220 10% 65% (Muted gray)
- Tertiary Text: 220 8% 45% (Subtle gray)

### B. Typography

**Font Families**
- Primary: 'Inter' for UI and data (Google Fonts)
- Monospace: 'JetBrains Mono' for numbers and prices (crisp financial data)
- Korean Support: 'Noto Sans KR' as fallback

**Type Scale**
- Hero Numbers: text-4xl/5xl font-bold (portfolio value)
- Section Headers: text-2xl font-semibold
- Stock Prices: text-xl font-mono (tracking-tight)
- Data Labels: text-sm font-medium
- Micro Text: text-xs (timestamps, fees)

### C. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (within cards)
- Standard: p-4, gap-4 (component padding)
- Generous: p-8, gap-8 (section separation)

**Grid System**
- Dashboard: 12-column grid (lg:grid-cols-12)
- Main Content: 8 columns, Sidebar: 4 columns
- Stock List: 3-4 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Mobile: Single column stack

**Container**
- Max width: max-w-7xl
- Padding: px-4 md:px-6 lg:px-8

### D. Component Library

**Navigation**
- Top navbar: Fixed dark navy (backdrop-blur-xl bg-[220,25%,8%]/90)
- Logo + Account balance + User menu
- Mobile: Hamburger menu with slide-in drawer

**Dashboard Cards**
- Portfolio Summary Card: Large card with total value, day change (percentage + absolute)
- Holdings Grid: Cards showing stock symbol, quantity, current price, profit/loss with color coding
- Watchlist Panel: Compact list with mini sparkline charts
- Recent Transactions: Timeline-style list with buy/sell indicators

**Stock Trading Components**
- Stock Detail Panel: Large price display, interactive chart, buy/sell buttons
- Order Modal: Centered modal with quantity input, estimated total, confirmation button
- Price Input: Custom number input with increment/decrement buttons
- Transaction Confirmation: Success/error toast notifications

**Data Visualization**
- Line Charts: Smooth bezier curves with gradient fill below (green for profit, red for loss)
- Candlestick Charts: For detailed stock view
- Mini Sparklines: 24px height inline charts for quick trends
- Percentage Badges: Rounded pills with +/- indicators

**Forms & Inputs**
- Search Bar: Prominent with icon, rounded-lg, focus ring in primary blue
- Number Inputs: Monospace font, right-aligned, clear increment buttons
- Buttons: Solid primary (bg-blue), outline secondary, danger (bg-red) for sell actions

**Tables**
- Transaction History: Striped rows, sticky header, sortable columns
- Stock List: Dense table with hover states showing quick actions

### E. Interaction Patterns

**Real-time Updates**
- Pulse animation on price changes (green pulse for up, red for down)
- Smooth number transitions using counter animations
- Live badge indicator for market status

**Trading Flow**
1. Stock card click → Detail panel slide-in
2. Buy/Sell button → Modal with form
3. Confirm → Loading state → Success toast → Portfolio update animation

**Hover States**
- Cards: Subtle border glow (border-primary/50)
- Buttons: Brightness increase, no dramatic transforms
- Stock rows: Background lighten to surface+5%

**Loading States**
- Skeleton screens matching component structure
- Shimmer effect on loading cards (subtle blue shimmer)
- Spinner only for modal actions

### F. Accessibility & Responsiveness

**Mobile Adaptations**
- Bottom navigation bar for main actions
- Collapsible chart (full-screen option)
- Simplified table to card view on mobile
- Touch-optimized buttons (min-height: 44px)

**Keyboard Navigation**
- Tab order: Search → Stock list → Trading panel
- Escape closes modals
- Enter confirms trades

**Screen Reader**
- ARIA labels on all trading actions
- Live regions for price updates
- Clear form validation messages

## Images

**Hero/Dashboard Background**: No large hero image. Instead, use subtle geometric pattern overlay (grid lines suggesting stock charts) in deep navy with 5% opacity over the base background. This provides visual interest without distraction.

**Stock Logos**: 40x40px placeholder circles with company initials on colored backgrounds (use deterministic color based on ticker symbol)

**Empty States**: Simple icon illustrations (chart icon, wallet icon) in muted colors when no data exists

## Key Design Principles

1. **Data First**: Financial information takes visual priority over decorative elements
2. **Confident Actions**: Trading buttons are clear, immediate, with strong confirmation patterns
3. **Numeric Clarity**: All financial numbers use monospace fonts for easy scanning
4. **Status Awareness**: Color-coded feedback (green/red) is instant and consistent
5. **Performance**: Minimize animations; prioritize smooth data updates and transitions
6. **Trust**: Professional, Bloomberg-inspired aesthetic builds confidence in the platform