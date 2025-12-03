# Button and Form Styling Guide

This document describes the standardized button and form styling patterns used throughout the ReCd(fyi) application.

## Button Styles

### Standard Button Classes

All buttons should use the `.button` base class or the `<RetroButton>` component, which provides consistent Y2K-style 3D effects.

#### Base Button
```html
<button class="button button-primary">Click Me</button>
```

#### Button Variants

- **`.button-primary`** - Blue gradient, for primary actions (e.g., "Save", "Create")
- **`.button-secondary`** - Silver gradient, for secondary actions (e.g., "Cancel", "Back")
- **`.button-danger`** - Red gradient, for destructive actions (e.g., "Delete", "Remove")
- **`.button-success`** - Green gradient, for success actions (e.g., "Confirm", "Accept")

#### Button Sizes

- **`.button-small`** - Compact size (10px font, reduced padding)
- **`.button-medium`** - Default size (11px font, standard padding)
- **`.button-large`** - Large size (12px font, increased padding)

#### Button Width

- **`.button-full-width`** - Makes button span full width of container

#### Link-Style Button

For buttons that should look like links:
```html
<button class="button-link">Learn More</button>
```

### Button States

All buttons have consistent states:

1. **Default** - 3D outset border effect with subtle shadow
2. **Hover** - Slight brightness increase, moves up 1px, enhanced shadow
3. **Active/Pressed** - Inverted borders (inset effect), moves down 1px, darker
4. **Focus** - 2px dotted outline with 2px offset
5. **Disabled** - 50% opacity, grayscale filter, not-allowed cursor

### Using RetroButton Component

```tsx
import { RetroButton } from '@/components/ui';

<RetroButton variant="primary" size="medium">
  Click Me
</RetroButton>
```

Props:
- `variant`: 'primary' | 'secondary' | 'danger' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- All standard button HTML attributes

## Form Input Styles

### Standard Input Styling

All form inputs (input, textarea, select) have consistent styling:

```html
<input type="text" class="form-input" />
```

#### Input States

1. **Default** - Inset border effect with subtle inner shadow
2. **Hover** - Darker border on top/left edges
3. **Focus** - 2px dotted outline, blue border color
4. **Disabled** - Light gray background, gray text, reduced opacity
5. **Error** - Red border, light red background

#### Error State

Add the `.error` class to inputs with validation errors:
```html
<input type="email" class="form-input error" />
```

### Form Layout Utilities

#### Form Group

Standard form field container:
```html
<div class="form-group">
  <label class="form-label">Email Address</label>
  <input type="email" class="form-input" />
  <span class="form-hint">We'll never share your email</span>
</div>
```

#### Form Label

- **`.form-label`** - Bold, 11px, black text
- **`.form-label-required`** - Adds red asterisk after label

#### Form Hints and Errors

- **`.form-hint`** - 10px, gray, italic text for helpful hints
- **`.form-error`** - 10px, red, bold text for error messages

#### Form Actions

Container for form buttons:
```html
<div class="form-actions">
  <button class="button button-secondary">Cancel</button>
  <button class="button button-primary">Submit</button>
</div>
```

Modifiers:
- **`.form-actions-start`** - Align buttons to start (left)
- **`.form-actions-center`** - Center align buttons
- **`.form-actions-stretch`** - Stack buttons vertically, full width

## Accessibility Features

### Keyboard Navigation

- All buttons and inputs are keyboard accessible
- Focus states are clearly visible with dotted outlines
- Tab order follows logical flow

### Reduced Motion

When users have `prefers-reduced-motion` enabled:
- All transitions are disabled
- Transform animations are removed
- Functionality remains intact

### Touch Targets

On touch devices (mobile):
- Minimum touch target size of 44x44px
- Increased padding for easier tapping
- Hover states are adapted for touch

## Best Practices

### Button Usage

1. **Use semantic HTML** - Use `<button>` for actions, `<a>` for navigation
2. **Choose appropriate variants** - Primary for main action, secondary for alternatives
3. **Provide clear labels** - Button text should describe the action
4. **Disable during loading** - Prevent double-submission

### Form Input Usage

1. **Always use labels** - Every input should have an associated label
2. **Provide helpful hints** - Use `.form-hint` for format guidance
3. **Show clear errors** - Use `.form-error` for validation messages
4. **Group related fields** - Use `.form-group` for consistent spacing

### Responsive Considerations

1. **Mobile-first** - Forms stack vertically on mobile automatically
2. **Full-width buttons** - Use `.button-full-width` on mobile for easier tapping
3. **Touch-friendly** - Inputs automatically increase size on touch devices

## Migration Guide

### Updating Existing Buttons

**Before:**
```html
<button class="auth-button">Submit</button>
```

**After:**
```html
<button class="button button-primary">Submit</button>
```

Or use the component:
```tsx
<RetroButton variant="primary">Submit</RetroButton>
```

### Updating Existing Forms

**Before:**
```html
<div>
  <label>Email</label>
  <input type="email" />
</div>
```

**After:**
```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" />
</div>
```

## Examples

### Complete Form Example

```html
<form>
  <div class="form-group">
    <label class="form-label form-label-required">CD Name</label>
    <input type="text" class="form-input" required />
    <span class="form-hint">Choose a memorable name for your CD</span>
  </div>
  
  <div class="form-group">
    <label class="form-label">Description</label>
    <textarea class="form-input" rows="4"></textarea>
  </div>
  
  <div class="form-actions">
    <button type="button" class="button button-secondary">Cancel</button>
    <button type="submit" class="button button-primary">Create CD</button>
  </div>
</form>
```

### Button Group Example

```html
<div class="form-actions">
  <button class="button button-danger button-small">Delete</button>
  <button class="button button-secondary button-small">Edit</button>
  <button class="button button-primary button-small">Share</button>
</div>
```

## CSS Variables Reference

### Colors
- `--primary-blue`: #0066FF
- `--primary-purple`: #9933FF
- `--error-red`: #FF0000
- `--success-green`: #00FF00
- `--bg-silver`: #C0C0C0
- `--text-black`: #000000
- `--text-white`: #FFFFFF
- `--border-gray`: #808080

### Transitions
- `--transition-fast`: 0.1s ease
- `--transition-normal`: 0.2s ease
- `--transition-slow`: 0.3s ease

### Spacing
- `--spacing-unit`: 8px
- Use multipliers: `calc(var(--spacing-unit) * 2)` for 16px

## Testing Checklist

When implementing buttons and forms:

- [ ] All buttons have appropriate variant classes
- [ ] All inputs have labels
- [ ] Focus states are visible
- [ ] Hover states work correctly
- [ ] Disabled states are clear
- [ ] Error states are styled consistently
- [ ] Forms work on mobile (responsive)
- [ ] Keyboard navigation works
- [ ] Reduced motion is respected
- [ ] Touch targets are adequate (44x44px minimum)
