# WOW UI Implementation Report

## Overview

This document details the comprehensive visual effects implementation for FalcoElectrec, bringing "premium" WOW-factor UI while maintaining performance and accessibility.

## Visual Effect Components

### 1. AuthShell (`src/layouts/AuthShell.tsx`)
**Purpose:** Full-screen cinematic dark shell for authentication pages.

**Features:**
- Animated blob/ring effects using CSS keyframes
- Conic-gradient animated rings
- Backdrop-blur glass-morphism card
- Falco branding integration
- Respects `prefers-reduced-motion`

**Usage:**
```tsx
<AuthShell showLogo>
  <LoginForm />
</AuthShell>
```

### 2. AppShell (`src/layouts/AppShell.tsx`)
**Purpose:** Light-themed shell for dashboard/app pages.

**Features:**
- Subtle decorative gradients
- Fade-in animation
- Optional title/subtitle header
- Clean, professional aesthetic

### 3. WowKPICard (`src/components/ui/wow-kpi-card.tsx`)
**Purpose:** Premium KPI card with animated electric border.

**Features:**
- SVG turbulence filter for electric border
- Hover glow effect
- Trend indicator (up/down/neutral)
- Falls back to static gold border on mobile

**Usage:**
```tsx
<WowKPICard 
  title="Total Revenue" 
  value="₪12,500"
  subtitle="This month"
  icon={<DollarSign />}
  trend="up"
  change={18}
  accentColor="#D4AF37"
/>
```

### 4. WowActionCard (`src/components/ui/wow-action-card.tsx`)
**Purpose:** 3D tilt action card for dashboard quick actions.

**Features:**
- Mouse tracking with perspective tilt
- Spotlight/glow following cursor
- Smooth hover transitions
- Disabled state support

**Usage:**
```tsx
<WowActionCard 
  title="New Request"
  description="Submit a quick service request"
  icon={<Zap />}
  onClick={() => navigate('/new-request')}
  accentColor="#136F94"
/>
```

### 5. EffectsToggle (`src/components/ui/effects-toggle.tsx`)
**Purpose:** Global toggle for visual effects.

**Features:**
- Compact (icon-only) and full variants
- Synced with EffectsContext
- Visible in navbar when logged in

## Effects System

### EffectsContext (`src/utils/EffectsContext.tsx`)
Central state management for effects toggle:
- LocalStorage persistence
- Respects system `prefers-reduced-motion`
- Global provider wrapping app

### useEffectsPreference Hook (`src/utils/effects.ts`)
Determines if heavy effects should run:
- Checks for mobile/touchscreen devices
- Respects reduced motion preference
- Returns `canUseHeavyEffects` boolean

## Integration Points

### Pages Updated:
1. **Login** (`login-form.tsx`) - Uses AuthShell
2. **Signup** (`signup-form.tsx`) - Uses AuthShell
3. **Customer Dashboard** - WowKPICard + WowActionCard
4. **Engineer Dashboard** - WowKPICard + WowActionCard  
5. **Admin Dashboard** - WowKPICard (partial)
6. **Navbar** - EffectsToggle (compact)

### main.tsx Setup:
```tsx
<EffectsProvider>
  <DataProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </DataProvider>
</EffectsProvider>
```

## Performance Considerations

1. **Conditional Rendering:** Effects only render when `canUseHeavyEffects` is true
2. **Throttled Events:** Mouse move handlers use 16ms throttle (60fps)
3. **CSS Transforms:** All animations use GPU-accelerated properties
4. **Reduced Motion:** Falls back to simple hover states
5. **Mobile Graceful Degradation:** Static styles on touch devices

## Accessibility

- All interactive elements have `aria-label`
- Focus states visible on all buttons
- Color contrast meets WCAG AA
- `prefers-reduced-motion` respected
- Effects toggle gives user control

## Brand Colors

- **BZU Blue:** `#136F94` - Primary brand color
- **Falco Gold:** `#D4AF37` - Accent/premium
- **Slate-950:** `#0f172a` - Dark backgrounds
- **Success Green:** `#22c55e` - Positive trends
- **Warning Amber:** `#f59e0b` - Pending states

## File Summary

| File | Type | Purpose |
|------|------|---------|
| `AuthShell.tsx` | Layout | Auth page dark shell |
| `AppShell.tsx` | Layout | Dashboard light shell |
| `wow-kpi-card.tsx` | Component | Electric border KPI |
| `wow-action-card.tsx` | Component | 3D tilt action card |
| `effects-toggle.tsx` | Component | Effects on/off toggle |
| `EffectsContext.tsx` | Context | Global effects state |
| `effects.ts` | Utility | Effects preference hook |

## Credits

See `/credits` page for full attribution of third-party effects and licenses.
