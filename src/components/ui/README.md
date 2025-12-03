# Retro UI Components

This directory contains reusable UI components with a Y2K/retro aesthetic for the ReCd(fyi) platform.

## Components

### RetroLayout

Fixed-width container component with Y2K aesthetic and 3D border effects.

```tsx
import { RetroLayout } from './components/ui';

<RetroLayout>
  <YourContent />
</RetroLayout>
```

**Props:**
- `children: ReactNode` - Content to render inside the layout
- `className?: string` - Optional additional CSS classes

### RetroButton

Button component with 3D effects and retro styling.

```tsx
import { RetroButton } from './components/ui';

<RetroButton variant="primary" size="medium" onClick={handleClick}>
  Click Me
</RetroButton>
```

**Props:**
- `children: ReactNode` - Button content
- `variant?: 'primary' | 'secondary' | 'danger'` - Button style variant (default: 'primary')
- `size?: 'small' | 'medium' | 'large'` - Button size (default: 'medium')
- `disabled?: boolean` - Disabled state
- All standard HTML button attributes

**Variants:**
- `primary` - Blue gradient background
- `secondary` - Silver gradient background
- `danger` - Red gradient background

### DiscAnimation

CD insert/eject animation component for transitions.

```tsx
import { DiscAnimation } from './components/ui';

<DiscAnimation 
  type="insert" 
  onComplete={() => console.log('Animation complete')}
  duration={500}
/>
```

**Props:**
- `type: 'insert' | 'eject'` - Animation type
- `onComplete?: () => void` - Callback when animation completes
- `duration?: number` - Animation duration in milliseconds (default: 500)

**Usage:**
- `insert` - CD slides in from right with rotation
- `eject` - CD slides out to right with rotation

### LoadingSpinner

CD spinning animation for loading states.

```tsx
import { LoadingSpinner } from './components/ui';

<LoadingSpinner size="medium" message="Loading..." />
```

**Props:**
- `size?: 'small' | 'medium' | 'large'` - Spinner size (default: 'medium')
- `message?: string` - Optional loading message to display

**Sizes:**
- `small` - 40px diameter
- `medium` - 80px diameter
- `large` - 120px diameter

### Toast

Toast notification component (already existed, included for completeness).

```tsx
import { Toast, ToastContainer } from './components/ui';

<Toast 
  message="Success!" 
  type="success" 
  onClose={handleClose}
/>
```

## Theme Variables

The components use CSS custom properties defined in `src/styles/index.css`:

### Colors
- `--primary-blue: #0066FF`
- `--primary-purple: #9933FF`
- `--accent-cyan: #00FFFF`
- `--accent-pink: #FF00FF`
- `--bg-silver: #C0C0C0`
- `--bg-dark: #000080`
- `--text-black: #000000`
- `--text-white: #FFFFFF`
- `--border-gray: #808080`
- `--success-green: #00FF00`
- `--error-red: #FF0000`
- `--warning-yellow: #FFFF00`

### Spacing
- `--spacing-unit: 8px` - Base spacing unit (use multiples for consistency)

### Typography
- Font family: "MS Sans Serif", "Tahoma", sans-serif
- Base font size: 11px
- Headings: 16px (h1), 14px (h2), 12px (h3)

## Utility Classes

Global utility classes available in `src/styles/index.css`:

### Layout
- `.retro-panel` - Panel with inset 3D border
- `.retro-window` - Window with outset 3D border
- `.retro-title-bar` - Blue gradient title bar

### Text Alignment
- `.text-center`, `.text-left`, `.text-right`

### Spacing
- `.mt-1`, `.mt-2`, `.mt-3` - Margin top
- `.mb-1`, `.mb-2`, `.mb-3` - Margin bottom
- `.p-1`, `.p-2`, `.p-3` - Padding

## Design Principles

1. **Sharp Corners**: No border-radius (retro aesthetic)
2. **3D Effects**: Use inset/outset borders for depth
3. **Y2K Colors**: Bright, saturated colors from early 2000s
4. **Fixed Width**: 960px max-width for desktop
5. **Responsive**: Graceful degradation on mobile
6. **Accessibility**: Keyboard navigation and focus indicators

## Responsive Behavior

- **Desktop (> 960px)**: Full fixed-width layout with all animations
- **Tablet (600px - 960px)**: Fluid width with reduced animations
- **Mobile (< 600px)**: Full width with simplified or no animations

## Browser Compatibility

Components are designed for modern browsers with CSS Grid, Flexbox, and CSS custom properties support. Fallbacks are provided where necessary.
