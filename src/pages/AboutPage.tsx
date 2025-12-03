/**
 * About page - Information about ReCd(fyi) platform
 */

import { Link } from 'react-router-dom';
import './InfoPages.css';

export function AboutPage() {
  return (
    <div className="info-page">
      <div className="info-container">
        <header className="info-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>About ReCd(fyi)</h1>
        </header>

        <div className="info-content">
          <section className="info-section">
            <h2>Our Story</h2>
            <p>
              Remember the days when you'd spend hours carefully selecting songs, photos, and videos to burn onto a CD for your friends? 
              The anticipation as the burning progress bar slowly filled up? The excitement of decorating the disc with a Sharpie?
            </p>
            <p>
              ReCd(fyi) brings back that nostalgic experience for the digital age. We've recreated the magic of CD burning with 
              modern technology, allowing you to share memories with the same care and intention—but without the coasters.
            </p>
          </section>

          <section className="info-section">
            <h2>Why We Built This</h2>
            <p>
              In an era of instant messaging and cloud storage, we've lost something special: the deliberate act of curating 
              and sharing media. ReCd(fyi) is our love letter to the early 2000s, when sharing meant something more than 
              just dropping a link in a chat.
            </p>
            <p>
              We wanted to create a platform that combines the nostalgia of CD burning with the convenience of modern web technology. 
              No physical media required, but all the retro charm intact.
            </p>
          </section>

          <section className="info-section">
            <h2>The Technology</h2>
            <p>
              ReCd(fyi) is built on a fully serverless architecture using Firebase and modern web technologies:
            </p>
            <ul>
              <li><strong>React & TypeScript</strong> for a robust, type-safe frontend</li>
              <li><strong>Firebase Authentication</strong> for secure user management</li>
              <li><strong>Cloud Firestore</strong> for fast, scalable data storage</li>
              <li><strong>Firebase Storage</strong> for reliable media hosting</li>
              <li><strong>Vercel</strong> for lightning-fast global deployment</li>
            </ul>
            <p>
              Every line of code is written with care, following best practices for modularity, security, and performance.
            </p>
          </section>

          <section className="info-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🎨</div>
                <h3>Nostalgia</h3>
                <p>We celebrate the aesthetics and experiences that made the early 2000s special.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🔒</div>
                <h3>Privacy</h3>
                <p>Your data is yours. We use industry-standard security and never sell your information.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⚡</div>
                <h3>Performance</h3>
                <p>Fast, reliable, and built to scale. Your CDs load instantly, anywhere in the world.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💝</div>
                <h3>Simplicity</h3>
                <p>No complicated features. Just create, burn, and share—the way it should be.</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>Get In Touch</h2>
            <p>
              Have questions, feedback, or just want to share your favorite CD burning memory? 
              We'd love to hear from you!
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:info@vinamrasharma.com">info@vinamrasharma.com</a>
            </p>
          </section>
        </div>

        <footer className="info-footer">
          <Link to="/">Home</Link>
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </footer>
      </div>
    </div>
  );
}
