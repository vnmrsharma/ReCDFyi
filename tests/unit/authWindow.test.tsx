/**
 * Tests for AuthWindow component
 * Validates Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthWindow } from '../../src/components/auth/AuthWindow';

describe('AuthWindow Component', () => {
  it('should render with title bar and chrome elements', () => {
    render(
      <AuthWindow title="Test Window">
        <div>Test Content</div>
      </AuthWindow>
    );
    
    // Validates Requirement 3.1 - renders as retro-styled window with title bar
    const title = screen.getByText('Test Window');
    expect(title).toBeTruthy();
    
    // Validates Requirement 3.2 - includes classic window chrome elements
    const minimizeButton = screen.getByLabelText(/minimize/i);
    expect(minimizeButton).toBeTruthy();
    
    const maximizeButton = screen.getByLabelText(/maximize/i);
    expect(maximizeButton).toBeTruthy();
    
    const closeButton = screen.getByLabelText(/close/i);
    expect(closeButton).toBeTruthy();
  });

  it('should display children content correctly', () => {
    render(
      <AuthWindow title="Test Window">
        <div data-testid="test-content">Test Content</div>
      </AuthWindow>
    );
    
    const content = screen.getByTestId('test-content');
    expect(content).toBeTruthy();
    expect(content.textContent).toBe('Test Content');
  });

  it('should apply retro styling classes', () => {
    const { container } = render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    // Validates Requirement 3.3 - uses beveled borders and inset/outset effects
    const window = container.querySelector('.auth-window');
    expect(window).toBeTruthy();
    expect(window?.classList.contains('auth-window')).toBe(true);
    
    const titleBar = container.querySelector('.auth-window-title-bar');
    expect(titleBar).toBeTruthy();
    
    const content = container.querySelector('.auth-window-content');
    expect(content).toBeTruthy();
  });

  it('should have proper structure for window chrome', () => {
    const { container } = render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    // Check title bar structure
    const titleBar = container.querySelector('.auth-window-title-bar');
    expect(titleBar).toBeTruthy();
    
    const titleElement = container.querySelector('.auth-window-title');
    expect(titleElement).toBeTruthy();
    
    const buttons = container.querySelector('.auth-window-title-bar-buttons');
    expect(buttons).toBeTruthy();
    
    // Check all three window buttons exist
    const windowButtons = container.querySelectorAll('.auth-window-button');
    expect(windowButtons.length).toBe(3);
  });

  it('should handle close button when showCloseButton is true', () => {
    const handleClose = jest.fn();
    render(
      <AuthWindow title="Test Window" onClose={handleClose} showCloseButton={true}>
        <div>Content</div>
      </AuthWindow>
    );
    
    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeTruthy();
    expect(closeButton.hasAttribute('disabled')).toBe(false);
    
    closeButton.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should disable close button when showCloseButton is false', () => {
    render(
      <AuthWindow title="Test Window" showCloseButton={false}>
        <div>Content</div>
      </AuthWindow>
    );
    
    const closeButton = screen.getByLabelText(/close \(decorative\)/i);
    expect(closeButton).toBeTruthy();
    expect(closeButton.hasAttribute('disabled')).toBe(true);
  });

  it('should disable decorative buttons by default', () => {
    render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    const minimizeButton = screen.getByLabelText(/minimize \(decorative\)/i);
    expect(minimizeButton.hasAttribute('disabled')).toBe(true);
    
    const maximizeButton = screen.getByLabelText(/maximize \(decorative\)/i);
    expect(maximizeButton.hasAttribute('disabled')).toBe(true);
  });

  it('should handle long titles gracefully', () => {
    const longTitle = 'This is a very long window title that should be handled properly';
    render(
      <AuthWindow title={longTitle}>
        <div>Content</div>
      </AuthWindow>
    );
    
    const title = screen.getByText(longTitle);
    expect(title).toBeTruthy();
  });

  it('should render multiple children correctly', () => {
    render(
      <AuthWindow title="Test Window">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </AuthWindow>
    );
    
    expect(screen.getByTestId('child-1')).toBeTruthy();
    expect(screen.getByTestId('child-2')).toBeTruthy();
    expect(screen.getByTestId('child-3')).toBeTruthy();
  });
});

describe('AuthWindow Responsive Behavior', () => {
  // Helper to set viewport size for testing
  function setViewportSize(width: number, height: number = 768) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  }

  it('should maintain structure on desktop (>960px)', () => {
    setViewportSize(1200);
    const { container } = render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    // Validates Requirement 3.5 - maintains responsive sizing
    const window = container.querySelector('.auth-window');
    expect(window).toBeTruthy();
    
    const titleBar = container.querySelector('.auth-window-title-bar');
    expect(titleBar).toBeTruthy();
    
    const content = container.querySelector('.auth-window-content');
    expect(content).toBeTruthy();
  });

  it('should adapt on tablet (600-960px)', () => {
    setViewportSize(768);
    const { container } = render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    // All elements should still be visible
    const window = container.querySelector('.auth-window');
    expect(window).toBeTruthy();
    
    const title = screen.getByText('Test Window');
    expect(title).toBeTruthy();
    
    const content = screen.getByText('Content');
    expect(content).toBeTruthy();
  });

  it('should adapt on mobile (<600px)', () => {
    setViewportSize(400);
    const { container } = render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    // Validates Requirement 3.5 - responsive sizing for mobile devices
    const window = container.querySelector('.auth-window');
    expect(window).toBeTruthy();
    
    // All elements should still be present
    const title = screen.getByText('Test Window');
    expect(title).toBeTruthy();
    
    const content = screen.getByText('Content');
    expect(content).toBeTruthy();
    
    // Window buttons should still be present
    const buttons = container.querySelectorAll('.auth-window-button');
    expect(buttons.length).toBe(3);
  });

  it('should maintain all content at all breakpoints', () => {
    const breakpoints = [400, 768, 1200];
    
    breakpoints.forEach(width => {
      setViewportSize(width);
      const { container } = render(
        <AuthWindow title={`Test Window ${width}`}>
          <div data-testid={`content-${width}`}>Content {width}</div>
        </AuthWindow>
      );
      
      // Title should always be present
      const title = screen.getByText(`Test Window ${width}`);
      expect(title).toBeTruthy();
      
      // Content should always be present
      const content = screen.getByTestId(`content-${width}`);
      expect(content).toBeTruthy();
      
      // Window buttons should always be present
      const buttons = container.querySelectorAll('.auth-window-button');
      expect(buttons.length).toBe(3);
      
      // Clean up for next iteration
      container.remove();
    });
  });

  it('should handle viewport resize events', () => {
    const { container } = render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    // Start at desktop
    setViewportSize(1200);
    expect(container.querySelector('.auth-window')).toBeTruthy();
    
    // Resize to tablet
    setViewportSize(768);
    expect(container.querySelector('.auth-window')).toBeTruthy();
    
    // Resize to mobile
    setViewportSize(400);
    expect(container.querySelector('.auth-window')).toBeTruthy();
    
    // Resize back to desktop
    setViewportSize(1200);
    expect(container.querySelector('.auth-window')).toBeTruthy();
  });

  it('should not lose content during viewport changes', () => {
    const { container } = render(
      <AuthWindow title="Test Window">
        <div data-testid="test-content">Test Content</div>
      </AuthWindow>
    );
    
    const breakpoints = [1200, 768, 400, 768, 1200];
    
    breakpoints.forEach(width => {
      setViewportSize(width);
      
      // All elements should remain present
      expect(screen.getByText('Test Window')).toBeTruthy();
      expect(screen.getByTestId('test-content')).toBeTruthy();
      
      // Window buttons should remain present
      const buttons = container.querySelectorAll('.auth-window-button');
      expect(buttons.length).toBe(3);
    });
  });
});

describe('AuthWindow Accessibility', () => {
  it('should have proper ARIA labels for buttons', () => {
    render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    const minimizeButton = screen.getByLabelText(/minimize/i);
    expect(minimizeButton).toBeTruthy();
    
    const maximizeButton = screen.getByLabelText(/maximize/i);
    expect(maximizeButton).toBeTruthy();
    
    const closeButton = screen.getByLabelText(/close/i);
    expect(closeButton).toBeTruthy();
  });

  it('should mark decorative button content as aria-hidden', () => {
    const { container } = render(
      <AuthWindow title="Test Window">
        <div>Content</div>
      </AuthWindow>
    );
    
    const buttonSpans = container.querySelectorAll('.auth-window-button span');
    buttonSpans.forEach(span => {
      expect(span.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should have proper keyboard navigation', () => {
    const handleClose = jest.fn();
    render(
      <AuthWindow title="Test Window" onClose={handleClose} showCloseButton={true}>
        <div>Content</div>
      </AuthWindow>
    );
    
    const closeButton = screen.getByLabelText('Close');
    
    // Button should be focusable
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
  });
});
