# Responsive Design Implementation

This document describes the responsive design and accessibility features implemented in the ReCd platform.

## Overview

The platform is fully responsive and provides an optimal experience across all device sizes, from mobile phones to desktop computers. It also includes accessibility features for users who prefer reduced motion and touch-friendly interfaces.

## Breakpoints

The application uses the following breakpoints:

- **Mobile**: < 480px
- **Small Tablet**: 480px - 600px
- **Tablet**: 600px - 768px
- **Desktop**: 768px - 960px
- **Large Desktop**: > 960px

## Key Features

### 1. Mobile-Friendly CD Grid Layout

- **Desktop (> 768px)**: 4-column grid with 220px minimum card width
- **Tablet (600px - 768px)**: 2-3 column grid with 180px minimum card width
- **Mobile (< 600px)**: 2 column grid with 150px minimum card width
- **Small Mobile (< 480px)**: Single column with horizontal card layout

### 2. Touch-Friendly Interfaces

For touch devices (detected via `(hover: none) and (pointer: coarse)`):
- All interactive elements have minimum 44x44px touch targets
- Buttons have increased padding (12px vertical, 20px horizontal)
- Input fields are sized to prevent iOS zoom (16px font size)
- Links have adequate spacing for easy tapping

### 3. Bottom Sheet Modal on Mobile

On screens < 480px, modals (especially the share modal) transform into bottom sheets:
- Slide up from bottom of screen
- Rounded top corners (16px radius)
- Takes up 85% of viewport height maximum
- Easier to interact with on mobile devices

### 4. Simplified Animations for Slow Devices

When `prefers-reduced-motion: reduce` is detected:
- Disc spinning animations are disabled
- Laser effects in burning animation are hidden
- Transitions are reduced to 0.01ms
- Fade/scale animations become instant
- Loading spinners show pulsing effect instead of rotation

This improves performance on:
- Older devices
- Low-end hardware
- Users with motion sensitivity
- Battery-saving modes

### 5. Responsive Typography

Text sizes scale down on smaller screens:
- **Desktop**: 11-16px base sizes
- **Tablet**: 10-15px base sizes
- **Mobile**: 10-14px base sizes
- **Small Mobile**: 10-13px base sizes

### 6. Responsive Spacing

Padding and margins reduce on smaller screens:
- **Desktop**: 24px standard padding
- **Tablet**: 16px standard padding
- **Mobile**: 12px standard padding
- **Small Mobile**: 8px standard padding

### 7. Adaptive File Upload

The file upload drop zone adapts to screen size:
- **Desktop**: 200px minimum height, 48px icon
- **Tablet**: 180px minimum height, 40px icon
- **Mobile**: 160px minimum height, 36px icon
- **Small Mobile**: 140px minimum height, 32px icon

### 8. Responsive Preview Modal

File preview modals adapt to available space:
- **Desktop**: 90vw max width, 70vh max image height
- **Mobile**: 100vw width, 60vh max image height
- **Small Mobile**: Full screen, 50vh max image height

## Custom Hooks

### useReducedMotion()

Detects if user prefers reduced motion:

```typescript
const prefersReducedMotion = useReducedMotion();
```

### useMediaQuery(query)

Generic hook for media query detection:

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
```

### useIsMobile()

Convenience hook for mobile detection:

```typescript
const isMobile = useIsMobile();
```

### useIsTouchDevice()

Detects touch-capable devices:

```typescript
const isTouchDevice = useIsTouchDevice();
```

## CSS Utilities

### Responsive Utilities (`src/styles/responsive.css`)

- `.hide-mobile` / `.show-mobile` - Show/hide on mobile
- `.hide-tablet` / `.show-tablet` - Show/hide on tablet
- `.hide-desktop` / `.show-desktop` - Show/hide on desktop
- `.container-responsive` - Responsive container with padding
- `.grid-responsive` - Responsive grid layout
- `.flex-responsive` - Responsive flex layout (stacks on mobile)
- `.stack-mobile` - Stack elements vertically on mobile
- `.full-width-mobile` - Full width on mobile devices
- `.touch-target` - Ensures 44x44px minimum touch target
- `.text-responsive` - Responsive text sizing

## Component-Specific Responsive Features

### CD Collection
- Grid adapts from 4 columns to 1 column
- Cards switch to horizontal layout on small mobile
- Header stacks vertically on mobile

### CD Detail View
- Header stacks vertically on tablet/mobile
- File actions stack vertically on mobile
- Disc icon scales down on smaller screens

### Burning Progress
- Modal width reduces on mobile
- Disc size scales from 150px to 80px
- Progress bar height reduces on mobile

### Share Modal
- Transforms to bottom sheet on mobile
- Link input and copy button stack vertically
- Tab buttons become full width on mobile

### File Preview
- Full screen on mobile
- Image/video max height reduces on mobile
- Audio player adapts width on mobile

## Testing Responsive Design

### Browser DevTools
1. Open Chrome/Firefox DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test various device presets
4. Test custom viewport sizes

### Testing Reduced Motion
1. Enable in OS settings:
   - **macOS**: System Preferences > Accessibility > Display > Reduce motion
   - **Windows**: Settings > Ease of Access > Display > Show animations
   - **iOS**: Settings > Accessibility > Motion > Reduce Motion
2. Or use DevTools:
   - Chrome: DevTools > Rendering > Emulate CSS media feature prefers-reduced-motion

### Testing Touch Devices
- Use real mobile devices for best results
- Test tap targets are easy to hit
- Verify no hover-dependent interactions

## Performance Considerations

### Reduced Motion Mode
- Disables all complex animations
- Reduces CPU/GPU usage
- Improves battery life
- Better for accessibility

### Mobile Optimizations
- Smaller disc animations on mobile
- Reduced shadow effects
- Simplified gradients where possible
- Touch-optimized interaction areas

## Browser Support

The responsive design works on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements for future versions:
- Progressive Web App (PWA) support
- Offline mode for viewing downloaded CDs
- Swipe gestures for mobile navigation
- Haptic feedback on touch devices
- Dark mode support
- Landscape orientation optimizations
