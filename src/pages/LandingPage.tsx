/**
 * Landing page - First page visitors see before authentication
 * Features Y2K aesthetic with CD burning nostalgia
 */

import { Link } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-logo">
            <div className="cd-icon-large">
              <div className="cd-icon-large__disc"></div>
              <div className="cd-icon-large__hole"></div>
              <div className="cd-icon-large__shine"></div>
            </div>
          </div>
          <h1 className="landing-title">ReCd(fyi)</h1>
          <p className="landing-tagline">Burn. Share. Relive the Y2K Era.</p>
          <p className="landing-subtitle">
            Create virtual CDs, upload your memories, and share them with friends—just like the good old days.
          </p>
          <div className="landing-cta">
            <Link to="/auth" className="button button-primary button-large">
              Get Started
            </Link>
            <a href="#features" className="button button-secondary button-large">
              Learn More
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="landing-section landing-features">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💿</div>
            <h3>Virtual CD Burning</h3>
            <p>Create virtual CDs with 20 MB capacity. Upload images, audio, and videos with retro burning animations.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📧</div>
            <h3>Easy Sharing</h3>
            <p>Share your CDs via email or shareable links. Recipients can view without signing up.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>30-Day Access</h3>
            <p>Shared CDs remain accessible for 30 days, giving friends plenty of time to download.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Y2K Aesthetic</h3>
            <p>Relive the early 2000s with authentic CD-tray animations, 3D buttons, and retro styling.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Storage</h3>
            <p>Your media is safely stored in the cloud with Firebase security rules protecting your data.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Serverless & Fast</h3>
            <p>Built on modern serverless architecture for lightning-fast performance and reliability.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Search</h3>
            <p>Smart metadata generation for public CDs. AI analyzes your files and creates searchable tags automatically.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Public Marketplace</h3>
            <p>Share your CDs with the world. Browse public collections and discover music, photos, and videos from other creators.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-section landing-how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your CD</h3>
            <p>Sign up and create a new virtual CD with a custom title.</p>
          </div>
          
          <div className="step-arrow">→</div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Burn Your Files</h3>
            <p>Upload photos, music, and videos. Watch the retro burning animation.</p>
          </div>
          
          <div className="step-arrow">→</div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Share the Magic</h3>
            <p>Send your CD via email or copy a shareable link to friends.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-section landing-cta-section">
        <div className="cta-box">
          <h2>Ready to Burn Your First CD?</h2>
          <p>Join ReCd(fyi) today and start sharing memories the nostalgic way.</p>
          <Link to="/auth" className="button button-primary button-large">
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>ReCd(fyi)</strong>
            <p>© 2025 ReCd(fyi). All rights reserved.</p>
          </div>
          <nav className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/help">Help</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
