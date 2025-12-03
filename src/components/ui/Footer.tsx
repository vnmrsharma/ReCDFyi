import { FOOTER_LINKS, APP_VERSION } from '../../utils/constants';
import './Footer.css';

export interface FooterProps {
  className?: string;
}

/**
 * Footer component with Y2K styling
 * Displays copyright, version, and navigation links
 */
export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${className}`} role="contentinfo">
      <div className="footer-content">
        <div className="footer-info">
          <span className="footer-copyright">
            © {currentYear} ReCd(fyi)
          </span>
          <span className="footer-version">
            v{APP_VERSION}
          </span>
        </div>
        
        <nav className="footer-nav" aria-label="Footer navigation">
          <ul className="footer-links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label} className="footer-link-item">
                <a
                  href={link.href}
                  className="footer-link"
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
