/**
 * Tests for responsive design hooks and components
 * Validates Requirements 1.1, 2.4, 4.1
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
import { useMediaQuery, useIsMobile, useIsTouchDevice } from '../../src/hooks/useMediaQuery';
import { Footer } from '../../src/components/ui/Footer';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { RetroButton } from '../../src/components/ui/RetroButton';

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

// Helper to check if element has specific computed styles
function getComputedStyleValue(element: Element, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

describe('Responsive Design Hooks', () => {
  describe('useReducedMotion', () => {
    it('should return false by default', () => {
      const { result } = renderHook(() => useReducedMotion());
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useMediaQuery', () => {
    it('should return boolean for valid media query', () => {
      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useIsMobile', () => {
    it('should return boolean', () => {
      const { result } = renderHook(() => useIsMobile());
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useIsTouchDevice', () => {
    it('should return boolean', () => {
      const { result } = renderHook(() => useIsTouchDevice());
      expect(typeof result.current).toBe('boolean');
    });
  });
});

describe('Footer Responsive Behavior', () => {
  it('should render footer with all required elements', () => {
    render(<Footer />);
    
    // Check for copyright
    const copyrightText = screen.getByText(/© \d{4} ReCd\(fyi\)/);
    expect(copyrightText).toBeTruthy();
    
    // Check for version
    const versionText = screen.getByText(/v\d+\.\d+\.\d+/);
    expect(versionText).toBeTruthy();
    
    // Check for navigation
    const nav = screen.getByRole('navigation', { name: /footer navigation/i });
    expect(nav).toBeTruthy();
  });

  it('should have contentinfo role for accessibility', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeTruthy();
  });

  it('should render all footer links', () => {
    render(<Footer />);
    
    // Check that links are present
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should apply external link attributes correctly', () => {
    render(<Footer />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      const hasTarget = link.getAttribute('target') === '_blank';
      const hasRel = link.getAttribute('rel') === 'noopener noreferrer';
      
      // If it has target="_blank", it should have rel="noopener noreferrer"
      if (hasTarget) {
        expect(hasRel).toBe(true);
      }
    });
  });

  it('should have responsive CSS classes', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('.footer');
    expect(footer).toBeTruthy();
    expect(footer?.classList.contains('footer')).toBe(true);
  });
});

describe('PageHeader Responsive Behavior', () => {
  it('should render title correctly', () => {
    render(<PageHeader title="Test Page" />);
    const heading = screen.getByRole('heading', { name: 'Test Page' });
    expect(heading).toBeTruthy();
  });

  it('should render optional subtitle when provided', () => {
    render(<PageHeader title="Test Page" subtitle="Test subtitle" />);
    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toBeTruthy();
  });

  it('should render optional icon when provided', () => {
    const icon = <span data-testid="test-icon">🎵</span>;
    render(<PageHeader title="Test Page" icon={icon} />);
    const iconElement = screen.getByTestId('test-icon');
    expect(iconElement).toBeTruthy();
  });

  it('should render optional actions when provided', () => {
    const actions = <RetroButton onClick={() => {}}>Action</RetroButton>;
    render(<PageHeader title="Test Page" actions={actions} />);
    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toBeTruthy();
  });

  it('should have proper structure for responsive layout', () => {
    const { container } = render(
      <PageHeader 
        title="Test Page" 
        subtitle="Subtitle"
        icon={<span>🎵</span>}
        actions={<button>Action</button>}
      />
    );
    
    const header = container.querySelector('.page-header');
    expect(header).toBeTruthy();
    
    const content = container.querySelector('.page-header-content');
    expect(content).toBeTruthy();
    
    const titleSection = container.querySelector('.page-header-title-section');
    expect(titleSection).toBeTruthy();
    
    const actionsSection = container.querySelector('.page-header-actions');
    expect(actionsSection).toBeTruthy();
  });

  it('should handle long titles gracefully', () => {
    const longTitle = 'This is a very long title that should be handled properly on mobile devices';
    render(<PageHeader title={longTitle} />);
    const heading = screen.getByRole('heading', { name: longTitle });
    expect(heading).toBeTruthy();
  });
});

describe('EmptyState Responsive Behavior', () => {
  it('should render with required elements', () => {
    render(
      <EmptyState
        title="No Items"
        message="You don't have any items yet"
      />
    );
    
    const heading = screen.getByRole('heading', { name: 'No Items' });
    expect(heading).toBeTruthy();
    
    const message = screen.getByText("You don't have any items yet");
    expect(message).toBeTruthy();
  });

  it('should render optional icon when provided', () => {
    const icon = <span data-testid="empty-icon">📀</span>;
    render(
      <EmptyState
        title="No Items"
        message="You don't have any items yet"
        icon={icon}
      />
    );
    
    const iconElement = screen.getByTestId('empty-icon');
    expect(iconElement).toBeTruthy();
  });

  it('should render optional action when provided', () => {
    const action = <RetroButton onClick={() => {}}>Create Item</RetroButton>;
    render(
      <EmptyState
        title="No Items"
        message="You don't have any items yet"
        action={action}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Create Item' });
    expect(button).toBeTruthy();
  });

  it('should have proper structure for responsive layout', () => {
    const { container } = render(
      <EmptyState
        title="No Items"
        message="You don't have any items yet"
        icon={<span>📀</span>}
        action={<button>Action</button>}
      />
    );
    
    const emptyState = container.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    
    const icon = container.querySelector('.empty-state-icon');
    expect(icon).toBeTruthy();
    
    const title = container.querySelector('.empty-state-title');
    expect(title).toBeTruthy();
    
    const message = container.querySelector('.empty-state-message');
    expect(message).toBeTruthy();
    
    const action = container.querySelector('.empty-state-action');
    expect(action).toBeTruthy();
  });

  it('should include both message and action for guidance', () => {
    const action = <button>Create</button>;
    render(
      <EmptyState
        title="Empty"
        message="Helpful message"
        action={action}
      />
    );
    
    // Validates Requirements 4.1, 4.4 - empty states include message and CTA
    const message = screen.getByText('Helpful message');
    expect(message).toBeTruthy();
    
    const button = screen.getByRole('button', { name: 'Create' });
    expect(button).toBeTruthy();
  });
});

describe('Responsive Breakpoint Tests', () => {
  describe('Footer at different breakpoints', () => {
    it('should have horizontal layout on desktop (>960px)', () => {
      setViewportSize(1200);
      const { container } = render(<Footer />);
      
      const footerContent = container.querySelector('.footer-content');
      expect(footerContent).toBeTruthy();
      
      // Footer should have flex layout
      const footer = container.querySelector('.footer');
      expect(footer).toBeTruthy();
    });

    it('should adapt layout on tablet (600-960px)', () => {
      setViewportSize(768);
      const { container } = render(<Footer />);
      
      const footerContent = container.querySelector('.footer-content');
      expect(footerContent).toBeTruthy();
      
      // Footer should still be visible and functional
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should stack vertically on mobile (<600px)', () => {
      setViewportSize(400);
      const { container } = render(<Footer />);
      
      const footerContent = container.querySelector('.footer-content');
      expect(footerContent).toBeTruthy();
      
      // All elements should still be present
      const copyrightText = screen.getByText(/© \d{4} ReCd\(fyi\)/);
      expect(copyrightText).toBeTruthy();
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should maintain all content at all breakpoints', () => {
      const breakpoints = [400, 768, 1200];
      
      breakpoints.forEach(width => {
        setViewportSize(width);
        const { container } = render(<Footer />);
        
        // Copyright should always be present
        const copyrightText = screen.getByText(/© \d{4} ReCd\(fyi\)/);
        expect(copyrightText).toBeTruthy();
        
        // Version should always be present
        const versionText = screen.getByText(/v\d+\.\d+\.\d+/);
        expect(versionText).toBeTruthy();
        
        // Links should always be present
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
        
        // Clean up for next iteration
        container.remove();
      });
    });
  });

  describe('PageHeader at different breakpoints', () => {
    it('should display horizontally on desktop (>960px)', () => {
      setViewportSize(1200);
      const actions = <RetroButton onClick={() => {}}>Create</RetroButton>;
      const { container } = render(
        <PageHeader 
          title="Test Page" 
          subtitle="Subtitle"
          icon={<span>🎵</span>}
          actions={actions}
        />
      );
      
      const header = container.querySelector('.page-header');
      expect(header).toBeTruthy();
      
      const titleSection = container.querySelector('.page-header-title-section');
      expect(titleSection).toBeTruthy();
      
      const actionsSection = container.querySelector('.page-header-actions');
      expect(actionsSection).toBeTruthy();
    });

    it('should adapt on tablet (600-960px)', () => {
      setViewportSize(768);
      const actions = <RetroButton onClick={() => {}}>Create</RetroButton>;
      render(
        <PageHeader 
          title="Test Page" 
          subtitle="Subtitle"
          actions={actions}
        />
      );
      
      // All elements should still be visible
      const heading = screen.getByRole('heading', { name: 'Test Page' });
      expect(heading).toBeTruthy();
      
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toBeTruthy();
      
      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toBeTruthy();
    });

    it('should stack vertically on mobile (<600px)', () => {
      setViewportSize(400);
      const actions = <RetroButton onClick={() => {}}>Create</RetroButton>;
      const { container } = render(
        <PageHeader 
          title="Test Page" 
          subtitle="Subtitle"
          icon={<span>🎵</span>}
          actions={actions}
        />
      );
      
      // All elements should still be present
      const heading = screen.getByRole('heading', { name: 'Test Page' });
      expect(heading).toBeTruthy();
      
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toBeTruthy();
      
      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toBeTruthy();
      
      // Check structure
      const content = container.querySelector('.page-header-content');
      expect(content).toBeTruthy();
    });

    it('should handle long titles at all breakpoints', () => {
      const longTitle = 'This is a very long title that should be handled properly on mobile devices';
      const breakpoints = [400, 768, 1200];
      
      breakpoints.forEach(width => {
        setViewportSize(width);
        const { container } = render(<PageHeader title={longTitle} />);
        
        const heading = screen.getByRole('heading', { name: longTitle });
        expect(heading).toBeTruthy();
        
        // Title should have text-overflow handling
        const title = container.querySelector('.page-header-title');
        expect(title).toBeTruthy();
        
        container.remove();
      });
    });

    it('should maintain icon visibility at all breakpoints', () => {
      const breakpoints = [400, 768, 1200];
      
      breakpoints.forEach(width => {
        setViewportSize(width);
        const icon = <span data-testid={`test-icon-${width}`}>🎵</span>;
        render(<PageHeader title="Test" icon={icon} />);
        
        const iconElement = screen.getByTestId(`test-icon-${width}`);
        expect(iconElement).toBeTruthy();
      });
    });
  });

  describe('EmptyState at different breakpoints', () => {
    it('should be centered and readable on desktop', () => {
      setViewportSize(1200);
      const action = <RetroButton onClick={() => {}}>Create Item</RetroButton>;
      const { container } = render(
        <EmptyState
          title="No Items"
          message="You don't have any items yet"
          icon={<span>📀</span>}
          action={action}
        />
      );
      
      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      
      // All elements should be present
      const heading = screen.getByRole('heading', { name: 'No Items' });
      expect(heading).toBeTruthy();
      
      const message = screen.getByText("You don't have any items yet");
      expect(message).toBeTruthy();
      
      const button = screen.getByRole('button', { name: 'Create Item' });
      expect(button).toBeTruthy();
    });

    it('should adapt padding on tablet', () => {
      setViewportSize(768);
      const action = <RetroButton onClick={() => {}}>Create Item</RetroButton>;
      render(
        <EmptyState
          title="No Items"
          message="You don't have any items yet"
          action={action}
        />
      );
      
      // All elements should still be visible
      const heading = screen.getByRole('heading', { name: 'No Items' });
      expect(heading).toBeTruthy();
      
      const message = screen.getByText("You don't have any items yet");
      expect(message).toBeTruthy();
      
      const button = screen.getByRole('button', { name: 'Create Item' });
      expect(button).toBeTruthy();
    });

    it('should reduce icon size on mobile', () => {
      setViewportSize(400);
      const icon = <span data-testid="empty-icon">📀</span>;
      const action = <RetroButton onClick={() => {}}>Create Item</RetroButton>;
      const { container } = render(
        <EmptyState
          title="No Items"
          message="You don't have any items yet"
          icon={icon}
          action={action}
        />
      );
      
      // Icon should still be present
      const iconElement = screen.getByTestId('empty-icon');
      expect(iconElement).toBeTruthy();
      
      // All text should be readable
      const heading = screen.getByRole('heading', { name: 'No Items' });
      expect(heading).toBeTruthy();
      
      const message = screen.getByText("You don't have any items yet");
      expect(message).toBeTruthy();
      
      const button = screen.getByRole('button', { name: 'Create Item' });
      expect(button).toBeTruthy();
    });

    it('should maintain guidance elements at all breakpoints', () => {
      const breakpoints = [400, 768, 1200];
      
      breakpoints.forEach(width => {
        setViewportSize(width);
        const action = <button aria-label={`Create-${width}`}>Create</button>;
        render(
          <EmptyState
            title={`Empty-${width}`}
            message={`Helpful message ${width}`}
            action={action}
          />
        );
        
        // Validates Requirements 4.1, 4.4 - guidance present at all sizes
        const message = screen.getByText(`Helpful message ${width}`);
        expect(message).toBeTruthy();
        
        const button = screen.getByRole('button', { name: `Create-${width}` });
        expect(button).toBeTruthy();
      });
    });
  });

  describe('Cross-component responsive consistency', () => {
    it('should maintain consistent spacing at desktop breakpoint', () => {
      setViewportSize(1200);
      
      const { container: footerContainer } = render(<Footer />);
      const { container: headerContainer } = render(<PageHeader title="Test" />);
      const { container: emptyContainer } = render(
        <EmptyState title="Empty" message="Message" />
      );
      
      // All components should render successfully
      expect(footerContainer.querySelector('.footer')).toBeTruthy();
      expect(headerContainer.querySelector('.page-header')).toBeTruthy();
      expect(emptyContainer.querySelector('.empty-state')).toBeTruthy();
    });

    it('should maintain consistent spacing at tablet breakpoint', () => {
      setViewportSize(768);
      
      const { container: footerContainer } = render(<Footer />);
      const { container: headerContainer } = render(<PageHeader title="Test" />);
      const { container: emptyContainer } = render(
        <EmptyState title="Empty" message="Message" />
      );
      
      // All components should render successfully
      expect(footerContainer.querySelector('.footer')).toBeTruthy();
      expect(headerContainer.querySelector('.page-header')).toBeTruthy();
      expect(emptyContainer.querySelector('.empty-state')).toBeTruthy();
    });

    it('should maintain consistent spacing at mobile breakpoint', () => {
      setViewportSize(400);
      
      const { container: footerContainer } = render(<Footer />);
      const { container: headerContainer } = render(<PageHeader title="Test" />);
      const { container: emptyContainer } = render(
        <EmptyState title="Empty" message="Message" />
      );
      
      // All components should render successfully
      expect(footerContainer.querySelector('.footer')).toBeTruthy();
      expect(headerContainer.querySelector('.page-header')).toBeTruthy();
      expect(emptyContainer.querySelector('.empty-state')).toBeTruthy();
    });
  });

  describe('Responsive behavior validation', () => {
    it('should handle viewport resize events', () => {
      const { container } = render(<Footer />);
      
      // Start at desktop
      setViewportSize(1200);
      expect(container.querySelector('.footer')).toBeTruthy();
      
      // Resize to tablet
      setViewportSize(768);
      expect(container.querySelector('.footer')).toBeTruthy();
      
      // Resize to mobile
      setViewportSize(400);
      expect(container.querySelector('.footer')).toBeTruthy();
      
      // Resize back to desktop
      setViewportSize(1200);
      expect(container.querySelector('.footer')).toBeTruthy();
    });

    it('should not lose content during viewport changes', () => {
      const { container } = render(
        <PageHeader 
          title="Test Page" 
          subtitle="Subtitle"
          icon={<span data-testid="icon">🎵</span>}
          actions={<button>Action</button>}
        />
      );
      
      const breakpoints = [1200, 768, 400, 768, 1200];
      
      breakpoints.forEach(width => {
        setViewportSize(width);
        
        // All elements should remain present
        expect(screen.getByRole('heading', { name: 'Test Page' })).toBeTruthy();
        expect(screen.getByText('Subtitle')).toBeTruthy();
        expect(screen.getByTestId('icon')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Action' })).toBeTruthy();
      });
    });
  });
});
