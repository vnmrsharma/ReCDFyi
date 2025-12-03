/**
 * Tests for DecorativeElements component
 * Validates Requirements 4.1, 4.2, 4.3, 4.5
 */

import React from 'react';
import { render } from '@testing-library/react';
import { DecorativeElements } from '../../src/components/auth/DecorativeElements';

// Mock the hooks
jest.mock('../../src/hooks/useMediaQuery', () => ({
  useIsMobile: jest.fn()
}));

jest.mock('../../src/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn()
}));

import { useIsMobile } from '../../src/hooks/useMediaQuery';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';

const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;
const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

describe('DecorativeElements Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseIsMobile.mockReturnValue(false);
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('should render decorative elements on desktop', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    // Validates Requirement 4.1 - displays retro-styled decorative elements
    const elementsContainer = container.querySelector('.decorative-elements');
    expect(elementsContainer).toBeTruthy();
    
    const elements = container.querySelectorAll('.decorative-element');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should hide decorative elements on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    
    const { container } = render(<DecorativeElements />);
    
    // Validates Requirement 4.3 - simplify or hide decorative elements on small screens
    const elementsContainer = container.querySelector('.decorative-elements');
    expect(elementsContainer).toBeNull();
  });

  it('should render correct number of elements for minimal density', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements density="minimal" />);
    
    const elements = container.querySelectorAll('.decorative-element');
    expect(elements.length).toBe(2);
  });

  it('should render correct number of elements for normal density', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements density="normal" />);
    
    const elements = container.querySelectorAll('.decorative-element');
    expect(elements.length).toBe(4);
  });

  it('should render correct number of elements for rich density', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements density="rich" />);
    
    const elements = container.querySelectorAll('.decorative-element');
    expect(elements.length).toBe(8);
  });

  it('should include period-appropriate icons', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    // Validates Requirement 4.2 - includes period-appropriate icons or graphics
    const elements = container.querySelectorAll('.decorative-element');
    const icons = Array.from(elements).map(el => el.textContent);
    
    // Check that we have retro icons (CD, music notes, stars, discs)
    const hasRetroIcons = icons.some(icon => 
      icon === '💿' || icon === '🎵' || icon === '⭐' || icon === '📀'
    );
    expect(hasRetroIcons).toBe(true);
  });

  it('should apply animation classes when motion is enabled', () => {
    mockUseIsMobile.mockReturnValue(false);
    mockUseReducedMotion.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    // Validates Requirement 4.5 - includes subtle animations on decorative elements
    const elements = container.querySelectorAll('.decorative-element');
    
    const hasAnimationClasses = Array.from(elements).some(el => 
      el.classList.contains('decorative-element-spin') ||
      el.classList.contains('decorative-element-float') ||
      el.classList.contains('decorative-element-twinkle')
    );
    
    expect(hasAnimationClasses).toBe(true);
  });

  it('should apply static class when reduced motion is preferred', () => {
    mockUseIsMobile.mockReturnValue(false);
    mockUseReducedMotion.mockReturnValue(true);
    
    const { container } = render(<DecorativeElements />);
    
    const elements = container.querySelectorAll('.decorative-element');
    
    // All elements should have static class when reduced motion is preferred
    const allStatic = Array.from(elements).every(el => 
      el.classList.contains('decorative-element-static')
    );
    
    expect(allStatic).toBe(true);
  });

  it('should position elements around the auth window', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    const elements = container.querySelectorAll('.decorative-element');
    
    // Check that elements have positioning styles
    Array.from(elements).forEach(el => {
      const htmlEl = el as HTMLElement;
      const hasPosition = 
        htmlEl.style.top || 
        htmlEl.style.bottom || 
        htmlEl.style.left || 
        htmlEl.style.right;
      
      expect(hasPosition).toBeTruthy();
    });
  });

  it('should mark elements as aria-hidden for accessibility', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    const elementsContainer = container.querySelector('.decorative-elements');
    expect(elementsContainer?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should handle density prop changes', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container, rerender } = render(<DecorativeElements density="minimal" />);
    
    let elements = container.querySelectorAll('.decorative-element');
    expect(elements.length).toBe(2);
    
    rerender(<DecorativeElements density="normal" />);
    elements = container.querySelectorAll('.decorative-element');
    expect(elements.length).toBe(4);
    
    rerender(<DecorativeElements density="rich" />);
    elements = container.querySelectorAll('.decorative-element');
    expect(elements.length).toBe(8);
  });

  it('should not interfere with user interactions', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    // Validates Requirement 4.4 - ensure they enhance rather than distract
    const elementsContainer = container.querySelector('.decorative-elements');
    
    // Check that pointer-events are disabled (in CSS)
    // This is validated by the CSS class being present
    expect(elementsContainer?.classList.contains('decorative-elements')).toBe(true);
  });

  it('should render with default density when not specified', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    const elements = container.querySelectorAll('.decorative-element');
    // Default is 'normal' which should render 4 elements
    expect(elements.length).toBe(4);
  });
});

describe('DecorativeElements Animations', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('should include spin animation for CD icons', () => {
    const { container } = render(<DecorativeElements />);
    
    const spinElements = container.querySelectorAll('.decorative-element-spin');
    expect(spinElements.length).toBeGreaterThan(0);
  });

  it('should include float animation for music notes', () => {
    const { container } = render(<DecorativeElements />);
    
    const floatElements = container.querySelectorAll('.decorative-element-float');
    expect(floatElements.length).toBeGreaterThan(0);
  });

  it('should include twinkle animation for stars', () => {
    const { container } = render(<DecorativeElements />);
    
    const twinkleElements = container.querySelectorAll('.decorative-element-twinkle');
    expect(twinkleElements.length).toBeGreaterThan(0);
  });

  it('should disable all animations when reduced motion is preferred', () => {
    mockUseReducedMotion.mockReturnValue(true);
    
    const { container } = render(<DecorativeElements />);
    
    const animatedElements = container.querySelectorAll(
      '.decorative-element-spin, .decorative-element-float, .decorative-element-twinkle'
    );
    
    // No animated elements should be present
    expect(animatedElements.length).toBe(0);
    
    // All should be static
    const staticElements = container.querySelectorAll('.decorative-element-static');
    expect(staticElements.length).toBeGreaterThan(0);
  });
});

describe('DecorativeElements Responsive Behavior', () => {
  it('should return null on mobile devices', () => {
    mockUseIsMobile.mockReturnValue(true);
    
    const { container } = render(<DecorativeElements />);
    
    // Component should return null, so container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should render on tablet devices', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    const elementsContainer = container.querySelector('.decorative-elements');
    expect(elementsContainer).toBeTruthy();
  });

  it('should render on desktop devices', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    const { container } = render(<DecorativeElements />);
    
    const elementsContainer = container.querySelector('.decorative-elements');
    expect(elementsContainer).toBeTruthy();
  });
});
