/**
 * Error Boundary component to catch React component errors
 * Provides fallback UI when errors occur in component tree
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with Y2K retro styling
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__header">
              ⚠️ Application Error
            </div>
            <div className="error-boundary__body">
              <div className="error-boundary__icon">💿</div>
              <h2 className="error-boundary__title">Oops! Something went wrong</h2>
              <p className="error-boundary__message">
                The CD player encountered an unexpected error. Don't worry, your data is safe. 
                Try refreshing the page or going back to continue.
              </p>
              <div className="error-boundary__actions">
                <button
                  className="error-boundary__button error-boundary__button--primary"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
                <button
                  className="error-boundary__button error-boundary__button--secondary"
                  onClick={this.handleReset}
                >
                  Try Again
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-boundary__details">
                  <summary>🔧 Error Details (Development Only)</summary>
                  <pre className="error-boundary__stack">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
