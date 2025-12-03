/**
 * Tests for WelcomeMessage component
 * Validates Requirements 7.1, 7.2, 7.3
 */

import { render, screen, waitFor } from '@testing-library/react';
import { WelcomeMessage } from '../../src/components/auth/WelcomeMessage';

describe('WelcomeMessage Component', () => {
  it('should render login view with correct content', () => {
    render(<WelcomeMessage view="login" />);
    
    // Validates Requirement 7.1 - displays welcoming headline
    expect(screen.getByText('Welcome Back to ReCd(fyi)')).toBeTruthy();
    
    // Validates Requirement 7.3 - includes platform description
    expect(screen.getByText('Share your memories, one disc at a time')).toBeTruthy();
  });

  it('should render signup view with correct content', () => {
    render(<WelcomeMessage view="signup" />);
    
    expect(screen.getByText('Join ReCd(fyi)')).toBeTruthy();
    expect(screen.getByText('Create your virtual CD collection')).toBeTruthy();
  });

  it('should render reset view with correct content', () => {
    render(<WelcomeMessage view="reset" />);
    
    expect(screen.getByText('Reset Your Password')).toBeTruthy();
    expect(screen.getByText("We'll help you get back in")).toBeTruthy();
  });

  it('should apply retro typography styling classes', () => {
    const { container } = render(<WelcomeMessage view="login" />);
    
    // Validates Requirement 7.2 - uses retro typography styling
    const headline = container.querySelector('.welcome-message-headline');
    expect(headline).toBeTruthy();
    
    const subtext = container.querySelector('.welcome-message-subtext');
    expect(subtext).toBeTruthy();
  });

  it('should include decorative icon', () => {
    const { container } = render(<WelcomeMessage view="login" />);
    
    const icon = container.querySelector('.welcome-message-icon');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have fade-in animation class structure', async () => {
    const { container } = render(<WelcomeMessage view="login" />);
    
    const message = container.querySelector('.welcome-message');
    expect(message).toBeTruthy();
    
    // Should eventually have visible class
    await waitFor(() => {
      expect(message?.classList.contains('welcome-message-visible')).toBe(true);
    }, { timeout: 200 });
  });

  it('should display different icons for different views', () => {
    const { container: loginContainer } = render(<WelcomeMessage view="login" />);
    const loginIcon = loginContainer.querySelector('.welcome-message-icon');
    expect(loginIcon?.textContent).toBe('💿');

    const { container: signupContainer } = render(<WelcomeMessage view="signup" />);
    const signupIcon = signupContainer.querySelector('.welcome-message-icon');
    expect(signupIcon?.textContent).toBe('🎵');

    const { container: resetContainer } = render(<WelcomeMessage view="reset" />);
    const resetIcon = resetContainer.querySelector('.welcome-message-icon');
    expect(resetIcon?.textContent).toBe('🔑');
  });

  it('should maintain readability with proper text structure', () => {
    const { container } = render(<WelcomeMessage view="login" />);
    
    // Validates Requirement 7.4 - maintains readability
    const headline = container.querySelector('.welcome-message-headline');
    expect(headline?.tagName).toBe('H1');
    
    const subtext = container.querySelector('.welcome-message-subtext');
    expect(subtext?.tagName).toBe('P');
  });

  it('should have proper component structure', () => {
    const { container } = render(<WelcomeMessage view="login" />);
    
    const message = container.querySelector('.welcome-message');
    expect(message).toBeTruthy();
    
    // Should contain all three elements
    const icon = container.querySelector('.welcome-message-icon');
    const headline = container.querySelector('.welcome-message-headline');
    const subtext = container.querySelector('.welcome-message-subtext');
    
    expect(icon).toBeTruthy();
    expect(headline).toBeTruthy();
    expect(subtext).toBeTruthy();
  });

  it('should handle view changes correctly', async () => {
    const { container, rerender } = render(<WelcomeMessage view="login" />);
    
    expect(screen.getByText('Welcome Back to ReCd(fyi)')).toBeTruthy();
    
    // Change to signup view
    rerender(<WelcomeMessage view="signup" />);
    
    await waitFor(() => {
      expect(screen.getByText('Join ReCd(fyi)')).toBeTruthy();
    });
    
    // Change to reset view
    rerender(<WelcomeMessage view="reset" />);
    
    await waitFor(() => {
      expect(screen.getByText('Reset Your Password')).toBeTruthy();
    });
  });
});

describe('WelcomeMessage Accessibility', () => {
  it('should mark decorative icon as aria-hidden', () => {
    const { container } = render(<WelcomeMessage view="login" />);
    
    const icon = container.querySelector('.welcome-message-icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should use semantic HTML for headline', () => {
    const { container } = render(<WelcomeMessage view="login" />);
    
    const headline = container.querySelector('h1');
    expect(headline).toBeTruthy();
    expect(headline?.classList.contains('welcome-message-headline')).toBe(true);
  });

  it('should have readable text content', () => {
    render(<WelcomeMessage view="login" />);
    
    // All text should be accessible to screen readers
    expect(screen.getByText('Welcome Back to ReCd(fyi)')).toBeTruthy();
    expect(screen.getByText('Share your memories, one disc at a time')).toBeTruthy();
  });
});
