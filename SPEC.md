# Cell Budget Tracker - SPEC.md

## 1. Concept & Vision

**"Budget Buddy"** - A playful, gamified expense tracker that makes managing money feel like a game, not a chore. Think of it as a personal finance companion with personality - it celebrates your wins, gently warns you before overspending, and makes daily expense entry feel satisfying rather than tedious.

The interface should feel alive with 3D elements, smooth animations, and delightful micro-interactions that make you *want* to check your budget.

## 2. Design Language

### Aesthetic Direction
**Neo-Playful 3D** - A fusion of depth and delight. Glassmorphism cards floating in 3D space, floating coin particles, and satisfying spring animations. The palette is warm and inviting, not cold and corporate.

### Color Palette
```
Primary:        #6366F1 (Indigo) - Main actions, headers
Secondary:      #8B5CF6 (Purple) - Accents, highlights
Success:        #10B981 (Emerald) - Under budget, positive
Warning:        #F59E0B (Amber) - Approaching limit
Danger:         #EF4444 (Red) - Over budget
Background:     #0F172A (Dark Slate) - Deep, immersive base
Surface:        #1E293B (Slate) - Cards, panels
Surface Light:  #334155 (Light Slate) - Elevated elements
Text Primary:   #F8FAFC (Slate 50) - Main text
Text Secondary: #94A3B8 (Slate 400) - Secondary text
```

### Typography
- **Headings**: Poppins (700, 600) - Bold, modern, playful
- **Body**: Inter (400, 500) - Clean readability
- **Numbers/Money**: Space Mono (700) - Monospace for financial data

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 16px (cards), 12px (buttons), 9999px (pills)

### Motion Philosophy
- **Spring animations**: All transitions use spring physics (stiffness: 300, damping: 30)
- **3D transforms**: Cards tilt on hover (rotateX/Y up to 5deg)
- **Particle systems**: Floating coins, sparkles on success
- **Staggered reveals**: Elements animate in sequence (100ms delay each)
- **Celebration bursts**: Confetti/sparkles when hitting milestones
- **Floating elements**: Ambient 3D floating coins in background

### Visual Assets
- **Icons**: Lucide React (consistent, clean)
- **3D Elements**: Three.js floating coins, animated piggy bank
- **Decorative**: Gradient orbs, blur circles, grain texture overlay

## 3. Layout & Structure

### Page Architecture
```
┌─────────────────────────────────────────────┐
│  Header: Week/Month Toggle + Settings       │
├─────────────────────────────────────────────┤
│  Hero Stats: Total Spent / Budget Left      │
│  (Large 3D animated card with progress)     │
├─────────────────────────────────────────────┤
│  Sector Cards: Groceries | Food | Fun       │
│  (3D tilting cards with sector details)     │
├─────────────────────────────────────────────┤
│  Quick Actions: Add Expense (FAB)           │
├─────────────────────────────────────────────┤
│  Recent Transactions (scrollable list)      │
└─────────────────────────────────────────────┘

Modal: Add Expense Form (slides up with spring)
Modal: Weekly Summary (animated breakdown)
```

### Responsive Strategy
- Mobile-first design (primary use case for daily quick updates)
- Cards stack on mobile, grid on desktop
- FAB always visible and accessible
- Bottom sheet for expense entry on mobile

## 4. Features & Interactions

### Core Features

#### A. Daily Expense Entry
- **Trigger**: Floating "+" button (bottom right, always visible)
- **Flow**: Tap → Modal slides up → Select sector → Enter amount → Optional note → Save
- **Animation**: Button scales on tap (1.1x), modal springs up from bottom
- **Feedback**: Success pulse, coin animation flying to sector card

#### B. Sector Tracking
- **Groceries**: Food items, household supplies
- **Food**: Restaurants, takeout, coffee (weekdays)
- **Fun/Weekends**: Entertainment, outings, weekends

Each sector displays:
- Current spent amount
- Budget limit (editable)
- Progress bar (animated fill)
- Color coding (green → yellow → red)
- Transaction count

#### C. Week View (Monday → Sunday)
- Auto-calculated total for current week
- Day-by-day breakdown
- Week-over-week comparison
- "Week Summary" button with detailed modal

#### D. Month View
- Monthly total across all sectors
- Sector-wise pie chart (animated)
- Comparison to previous month
- Budget utilization percentage

#### E. Budget Alerts
- **Approaching (80%)**: Yellow glow, subtle warning
- **Exceeded (100%)**: Red alert, shake animation
- **Under control**: Green celebration particles

### Interaction Details

| Element | Hover | Click | Long Press |
|---------|-------|-------|------------|
| Sector Card | 3D tilt, glow | Expand details | Edit budget |
| Add Button | Scale up, glow | Open modal | Quick add (last sector) |
| Transaction | Highlight | Edit options | Delete confirm |
| Stat Card | Subtle lift | Drill down | - |

### Edge Cases
- **Empty state**: Friendly illustration, "Start your journey" CTA
- **Zero budget**: Prompt to set budget with onboarding
- **Large amounts**: Formatted with commas, currency symbol
- **Offline**: LocalStorage persistence, sync indicator

## 5. Component Inventory

### Header
- Week/Month toggle (pill-style, animated indicator)
- Settings gear (opens settings modal)
- Current date display

### Hero Stats Card
- Large total amount (animated counter)
- Budget remaining with icon
- Circular progress ring (3D, animated)
- Sparkle particles when under budget

### Sector Card
- **Default**: Elevated card with icon, name, spent/budget
- **Hover**: 3D tilt, enhanced shadow, subtle glow
- **Active**: Pressed state, scale down slightly
- **Warning**: Pulsing yellow border
- **Danger**: Pulsing red border, shake
- **Success**: Green glow, occasional sparkle

### Floating Action Button
- Large "+" icon (animated rotation on hover)
- Ripple effect on tap
- Menu expands on long press (quick add options)

### Add Expense Modal
- Bottom sheet on mobile, centered on desktop
- Sector selector (large touch targets)
- Amount input (large numbers, auto-focus)
- Note input (optional, expandable)
- Save button (loading state, success feedback)

### Transaction Item
- Sector icon with color
- Amount and note
- Time/date
- Swipe to delete (with confirm)
- Tap to edit

### Weekly Summary Modal
- Total spent for week
- Per-day breakdown (bar chart)
- Per-sector breakdown (pie chart)
- Comparison to average
- "Your week in numbers" playful summary

## 6. Technical Approach

### Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + CSS Variables
- **Animation**: Framer Motion (primary), CSS animations (micro)
- **3D Elements**: CSS 3D transforms, optional Three.js for advanced
- **Icons**: Lucide React
- **State**: React useState/useReducer (no external state lib)
- **Persistence**: LocalStorage (simple, no backend needed)

### Data Model
```typescript
interface Expense {
  id: string;
  amount: number;
  sector: 'groceries' | 'food' | 'fun';
  note?: string;
  date: string; // ISO date
  createdAt: number; // timestamp
}

interface Budget {
  groceries: number;
  food: number;
  fun: number;
}

interface AppState {
  expenses: Expense[];
  budgets: Budget;
  weekStart: string; // Monday of current week
}
```

### File Structure
```
/src
  /components
    Header.jsx
    HeroStats.jsx
    SectorCard.jsx
    FAB.jsx
    AddExpenseModal.jsx
    TransactionList.jsx
    WeeklySummaryModal.jsx
    AnimatedCoin.jsx
  /hooks
    useExpenses.js
    useBudget.js
    useWeeklyData.js
  /utils
    dateUtils.js
    formatters.js
  App.jsx
  index.css
  main.jsx
index.html
package.json
vite.config.js
tailwind.config.js
```

### Key Implementation Notes
- All monetary values stored in cents to avoid floating point issues
- Week calculation: Monday 00:00 to Sunday 23:59
- Auto-save to LocalStorage on every state change
- Animations respect reduced-motion preferences
