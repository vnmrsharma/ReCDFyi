# Reduced Motion Testing Guide

This guide explains how to manually test the reduced motion support implementation for the auth page enhancement feature.

## Requirements Validated

- **Requirement 1.4**: WHEN a user has reduced motion preferences THEN the system SHALL display static background alternatives
- **Requirement 8.5**: WHEN animations play THEN the system SHALL respect reduced motion preferences

## What Was Implemented

### Components with Reduced Motion Support

1. **AnimatedBackground** - Disables gradient animations and geometric shape movements
2. **DecorativeElements** - Disables spin, float, and twinkle animations
3. **WelcomeMessage** - Disables fade-in and icon float animations
4. **LoginForm** - Disables form transition and error shake animations
5. **SignUpForm** - Disables form transition and error shake animations
6. **PasswordResetForm** - Disables form transition animations
7. **AuthWindow** - Disables button hover transitions
8. **AuthComponents** - Disables all button press, input focus, and link hover animations

### Implementation Approach

- All components use the `useReducedMotion` hook to detect user preferences
- CSS files include `@media (prefers-reduced-motion: reduce)` queries as fallback
- Animations are disabled by not applying animation classes when reduced motion is preferred
- Static alternatives are provided for all animated elements

## Manual Testing Instructions

### Testing in Chrome/Edge

1. Open Chrome DevTools (F12)
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open Command Palette
3. Type "Emulate CSS prefers-reduced-motion" and select it
4. Choose "prefers-reduced-motion: reduce"
5. Navigate to the auth page (`/auth`)
6. Verify the following:
   - Background gradient is static (no movement)
   - Decorative elements (CD icons, musical notes) don't animate
   - Welcome message appears instantly without fade-in
   - Icon doesn't float
   - Form transitions happen instantly
   - Button presses don't have transform animations
   - Error messages don't shake
   - Input focus doesn't have glow transitions

### Testing in Firefox

1. Open Firefox DevTools (F12)
2. Go to the "Accessibility" tab
3. Under "Simulate", check "prefers-reduced-motion: reduce"
4. Navigate to the auth page (`/auth`)
5. Verify the same behaviors as listed above

### Testing in Safari

1. Open Safari Preferences
2. Go to Accessibility tab
3. Check "Reduce motion"
4. Navigate to the auth page (`/auth`)
5. Verify the same behaviors as listed above

### Testing with OS Settings

#### macOS
1. Open System Preferences
2. Go to Accessibility > Display
3. Check "Reduce motion"
4. Open the app in any browser
5. Verify reduced motion behavior

#### Windows 10/11
1. Open Settings
2. Go to Ease of Access > Display
3. Turn on "Show animations in Windows"
4. Open the app in any browser
5. Verify reduced motion behavior

#### Linux (GNOME)
1. Open Settings
2. Go to Universal Access
3. Turn on "Reduce Animation"
4. Open the app in any browser
5. Verify reduced motion behavior

## Expected Behavior

### With Reduced Motion DISABLED (default)
- Gradient background animates smoothly
- Geometric shapes float and rotate
- Decorative elements spin, float, and twinkle
- Welcome message fades in with icon floating
- Forms slide in when switching views
- Buttons have 3D press effects
- Error messages shake
- Input fields have glow effects on focus
- Success states pulse

### With Reduced Motion ENABLED
- Gradient background is static
- Geometric shapes don't move
- Decorative elements are static with reduced opacity
- Welcome message appears instantly
- Icon doesn't float
- Forms appear instantly without transitions
- Buttons change state without transforms
- Error messages appear without shaking
- Input fields change border color without glow
- Success states appear without pulsing

## Automated Tests

Run the automated test suite:

```bash
npm test -- tests/unit/reducedMotion.test.tsx
```

This test suite verifies:
- AnimatedBackground applies correct classes based on reduced motion preference
- DecorativeElements applies static classes when reduced motion is enabled
- WelcomeMessage shows content immediately with reduced motion
- All form components (Login, SignUp, PasswordReset) respect reduced motion
- Animation classes are not applied when reduced motion is preferred

## CSS Media Query Coverage

All CSS files with animations include `@media (prefers-reduced-motion: reduce)` queries:

- `src/components/auth/AnimatedBackground.css`
- `src/components/auth/DecorativeElements.css`
- `src/components/auth/WelcomeMessage.css`
- `src/components/auth/AuthComponents.css`
- `src/components/auth/AuthWindow.css`
- `src/components/auth/LoadingOverlay.css`
- `src/pages/pages.css`

## Accessibility Compliance

This implementation ensures:
- Users with vestibular disorders can use the app without discomfort
- Users with motion sensitivity have a comfortable experience
- The app remains fully functional without animations
- WCAG 2.1 Level AA compliance for animation and motion (Success Criterion 2.3.3)

## Known Limitations

None. All animations have proper reduced motion fallbacks.

## Future Enhancements

- Add user preference toggle in settings to override system preference
- Add animation intensity slider (minimal, normal, rich)
- Store user preference in localStorage for consistency across sessions
