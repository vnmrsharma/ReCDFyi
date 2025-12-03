/**
 * PageHeader component
 * Retro-styled page title bar with optional subtitle, icon, and actions
 */

import type { ReactNode } from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader displays a consistent retro-styled title bar across pages
 * @param title - Main page title (required)
 * @param subtitle - Optional subtitle for additional context
 * @param icon - Optional icon element to display before the title
 * @param actions - Optional action buttons or elements to display on the right
 * @param className - Optional additional CSS classes
 */
export function PageHeader({ 
  title, 
  subtitle, 
  icon, 
  actions,
  className = '' 
}: PageHeaderProps) {
  return (
    <header className={`page-header ${className}`}>
      <div className="page-header-content">
        <div className="page-header-title-section">
          {icon && (
            <span className="page-header-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <div className="page-header-text">
            <h1 className="page-header-title">{title}</h1>
            {subtitle && (
              <p className="page-header-subtitle">{subtitle}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="page-header-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
