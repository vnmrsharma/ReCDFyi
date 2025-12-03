# Responsive Manual Testing Guide

## Quick Test Checklist

Use this guide to manually verify responsive behavior in your browser.

## Browser DevTools Setup

1. Open Chrome/Firefox DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M / Cmd+Shift+M)
3. Test at these viewport sizes:
   - **Mobile**: 375x667 (iPhone SE)
   - **Tablet**: 768x1024 (iPad)
   - **Desktop**: 1920x1080

## Components to Test

### 1. Footer Component

**Desktop (1920px)**
- [ ] Footer at bottom of page
- [ ] Copyright and version on left
- [ ] Links aligned right
- [ ] Horizontal layout

**Tablet (768px)**
- [ ] Footer still at bottom
- [ ] Horizontal layout maintained
- [ ] Slightly reduced spacing

**Mobile (375px)**
- [ ] Footer at bottom
- [ ] Vertical stack layout
- [ ] Centered content
- [ ] Links with bullet separators

### 2. PageHeader Component

**Desktop (1920px)**
- [ ] Title and icon on left
- [ ] Actions on right
- [ ] Horizontal layout
- [ ] Full padding

**Tablet (768px)**
- [ ] Horizontal layout maintained
- [ ] Slightly smaller fonts
- [ ] Reduced padding

**Mobile (375px)**
- [ ] Vertical stack
- [ ] Title section full width
- [ ] Actions below title
- [ ] Smaller fonts and icons

### 3. EmptyState Component

**Desktop (1920px)**
- [ ] Centered on page
- [ ] Large icon (150px)
- [ ] Readable text
- [ ] CTA button visible

**Tablet (768px)**
- [ ] Still centered
- [ ] Icon size maintained
- [ ] Text readable

**Mobile (375px)**
- [ ] Centered
- [ ] Smaller icon (120px)
- [ ] Smaller text
- [ ] CTA button full width

### 4. Page Layouts

**Test on these pages:**
- [ ] /collection
- [ ] /marketplace
- [ ] /settings
- [ ] /cd/:id (CD detail)

**Check for:**
- [ ] No horizontal scrolling
- [ ] All content visible
- [ ] Buttons accessible
- [ ] Text readable
- [ ] Images scale properly

## Specific Test Scenarios

### Sticky Footer Test
1. Navigate to a page with minimal content
2. Verify footer stays at bottom (not floating)
3. Add content to make page scroll
4. Verify footer moves with content

### Long Title Test
1. Create a CD with a very long name
2. Navigate to CD detail page
3. Check title truncates with ellipsis
4. Verify no text overflow

### Navigation Test
1. Resize from desktop to mobile
2. Check navigation adapts
3. Verify all links remain accessible
4. Test clicking each link

### Empty State Test
1. View empty collection
2. Check empty state displays
3. Verify message and CTA visible
4. Test CTA button works

## Breakpoint Transitions

Test smooth transitions between breakpoints:

1. Start at 1920px width
2. Slowly resize to 960px
3. Continue to 600px
4. Continue to 375px

**Check for:**
- [ ] No sudden jumps
- [ ] Smooth layout changes
- [ ] No content disappearing
- [ ] No overlapping elements

## Accessibility Tests

### Reduced Motion
1. Enable reduced motion in OS settings
2. Reload page
3. Verify no animations play
4. Check disc icons don't spin

### Keyboard Navigation
1. Use Tab key to navigate
2. Verify focus indicators visible
3. Check tab order logical
4. Test Enter/Space on buttons

### Screen Reader
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through page
3. Verify landmarks announced
4. Check link descriptions clear

## Common Issues to Watch For

### Mobile Issues
- [ ] Text too small to read
- [ ] Buttons too small to tap (min 44x44px)
- [ ] Horizontal scrolling
- [ ] Content cut off
- [ ] Overlapping elements

### Tablet Issues
- [ ] Awkward spacing
- [ ] Underutilized space
- [ ] Inconsistent layouts
- [ ] Touch targets too small

### Desktop Issues
- [ ] Content too wide
- [ ] Excessive whitespace
- [ ] Footer not at bottom
- [ ] Inconsistent alignment

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Device Testing (Optional)

If possible, test on real devices:
- [ ] iPhone (any model)
- [ ] Android phone
- [ ] iPad
- [ ] Android tablet

## Performance Check

At each breakpoint:
- [ ] Page loads quickly
- [ ] Smooth scrolling
- [ ] No layout shift
- [ ] Animations smooth (60fps)

## Sign-Off

After completing all tests:

**Tester**: _______________
**Date**: _______________
**Issues Found**: _______________
**Status**: ✅ Pass / ❌ Fail

## Notes

Use this section to document any issues or observations:

---

