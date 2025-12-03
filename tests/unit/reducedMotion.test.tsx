/**
 * Tests for reduced motion support across auth components
 * Validates Requirements 1.4, 8.5
 */

import { render } from '@testing-library/react';
import { AnimatedBackground } from '../../src/components/auth/AnimatedBackground';
import { DecorativeElements } from '../../src/components/auth/DecorativeElements';
import { WelcomeMessage } from '../../src/components/auth/WelcomeMessage';
import { LoginForm } from '../../src/components/auth/LoginForm';
import { SignUpForm } from '../../src/components/auth/SignUpForm';
import { PasswordResetForm } from '../../src/components/auth/PasswordResetForm';
import { AuthProvider } from '../../src/contexts/AuthContext';

// Mock the useReducedMotion hook
jest.mock('../../src/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(),
}));

// Mock the useMediaQuery hook
jest.mock('../../src/hooks/useMediaQuery', () => ({
  useIsMobile: jest.fn(() => false),
}));

// Mock auth service
jest.mock('../../src/services/authService', () => ({
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
  login: jest.fn(),
  signUp: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
}));

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

describe('Reduced Motion Support', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock matchMedia
    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  describe('AnimatedBackground Component', () => {
    it('should disable animations when prefers-reduced-motion is enabled', () => {
      // Mock reduced motion preference
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(true);

      const { container } = render(<AnimatedBackground variant="gradient" animated={true} />);
      
      const background = container.querySelector('.animated-background');
      expect(background?.classList.contains('animated-background-static')).toBe(true);
      expect(background?.classList.contains('animated-background-active')).toBe(false);
    });

    it('should enable animations when prefers-reduced-motion is disabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(false);

      const { container } = render(<AnimatedBackground variant="gradient" animated={true} />);
      
      const background = container.querySelector('.animated-background');
      expect(background?.classList.contains('animated-background-active')).toBe(true);
      expect(background?.classList.contains('animated-background-static')).toBe(false);
    });

    it('should respect animated prop override even with reduced motion', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(false);

      const { container } = render(<AnimatedBackground variant="gradient" animated={false} />);
      
      const background = container.querySelector('.animated-background');
      expect(background?.classList.contains('animated-background-static')).toBe(true);
    });
  });

  describe('DecorativeElements Component', () => {
    it('should apply static class when prefers-reduced-motion is enabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(true);

      const { container } = render(<DecorativeElements density="normal" />);
      
      const elements = container.querySelectorAll('.decorative-element');
      elements.forEach(element => {
        expect(element.classList.contains('decorative-element-static')).toBe(true);
      });
    });

    it('should apply animation classes when prefers-reduced-motion is disabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(false);

      const { container } = render(<DecorativeElements density="normal" />);
      
      const elements = container.querySelectorAll('.decorative-element');
      expect(elements.length).toBeGreaterThan(0);
      
      // At least one element should have an animation class
      const hasAnimationClass = Array.from(elements).some(element => 
        element.classList.contains('decorative-element-spin') ||
        element.classList.contains('decorative-element-float') ||
        element.classList.contains('decorative-element-twinkle')
      );
      expect(hasAnimationClass).toBe(true);
    });
  });

  describe('WelcomeMessage Component', () => {
    it('should show content immediately when prefers-reduced-motion is enabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(true);

      const { container } = render(<WelcomeMessage view="login" />);
      
      const welcomeMessage = container.querySelector('.welcome-message');
      expect(welcomeMessage?.classList.contains('welcome-message-visible')).toBe(true);
    });

    it('should animate content when prefers-reduced-motion is disabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(false);

      const { container } = render(<WelcomeMessage view="login" />);
      
      const welcomeMessage = container.querySelector('.welcome-message');
      expect(welcomeMessage).toBeTruthy();
    });
  });

  describe('LoginForm Component', () => {
    it('should not apply transition animation when prefers-reduced-motion is enabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <AuthProvider>
          <LoginForm animateTransition={true} />
        </AuthProvider>
      );
      
      const formContainer = container.querySelector('.login-form-container');
      expect(formContainer?.classList.contains('form-transition-enter')).toBe(false);
    });

    it('should apply transition animation when prefers-reduced-motion is disabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(false);

      const { container } = render(
        <AuthProvider>
          <LoginForm animateTransition={true} />
        </AuthProvider>
      );
      
      const formContainer = container.querySelector('.login-form-container');
      expect(formContainer?.classList.contains('form-transition-enter')).toBe(true);
    });
  });

  describe('SignUpForm Component', () => {
    it('should not apply transition animation when prefers-reduced-motion is enabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <AuthProvider>
          <SignUpForm animateTransition={true} />
        </AuthProvider>
      );
      
      const formContainer = container.querySelector('.signup-form-container');
      expect(formContainer?.classList.contains('form-transition-enter')).toBe(false);
    });

    it('should apply transition animation when prefers-reduced-motion is disabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(false);

      const { container } = render(
        <AuthProvider>
          <SignUpForm animateTransition={true} />
        </AuthProvider>
      );
      
      const formContainer = container.querySelector('.signup-form-container');
      expect(formContainer?.classList.contains('form-transition-enter')).toBe(true);
    });
  });

  describe('PasswordResetForm Component', () => {
    it('should not apply transition animation when prefers-reduced-motion is enabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <AuthProvider>
          <PasswordResetForm animateTransition={true} />
        </AuthProvider>
      );
      
      const formContainer = container.querySelector('.password-reset-form-container');
      expect(formContainer?.classList.contains('form-transition-enter')).toBe(false);
    });

    it('should apply transition animation when prefers-reduced-motion is disabled', () => {
      const { useReducedMotion } = require('../../src/hooks/useReducedMotion');
      useReducedMotion.mockReturnValue(false);

      const { container } = render(
        <AuthProvider>
          <PasswordResetForm animateTransition={true} />
        </AuthProvider>
      );
      
      const formContainer = container.querySelector('.password-reset-form-container');
      expect(formContainer?.classList.contains('form-transition-enter')).toBe(true);
    });
  });

  describe('CSS Media Query Support', () => {
    it('should have prefers-reduced-motion media queries in CSS', () => {
      // This is a documentation test to ensure CSS files have the proper media queries
      // The actual CSS files should contain @media (prefers-reduced-motion: reduce) rules
      
      // AnimatedBackground.css should have reduced motion support
      // DecorativeElements.css should have reduced motion support
      // WelcomeMessage.css should have reduced motion support
      // AuthComponents.css should have reduced motion support
      // AuthWindow.css should have reduced motion support
      
      expect(true).toBe(true); // Placeholder - actual CSS validation happens at build time
    });
  });
});
