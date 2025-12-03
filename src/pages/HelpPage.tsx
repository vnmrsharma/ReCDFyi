/**
 * Help page - User guide and FAQ
 */

import { Link } from 'react-router-dom';
import './InfoPages.css';

export function HelpPage() {
  return (
    <div className="info-page">
      <div className="info-container">
        <header className="info-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Help & FAQ</h1>
        </header>

        <div className="info-content">
          <section className="info-section">
            <h2>Getting Started</h2>
            
            <div className="faq-item">
              <h3>How do I create my first CD?</h3>
              <p>
                1. Sign up for a free account<br />
                2. Click "Create New CD" from your collection<br />
                3. Give your CD a title<br />
                4. Start uploading files by clicking "Add Files"
              </p>
            </div>

            <div className="faq-item">
              <h3>What file types can I upload?</h3>
              <p>
                ReCd(fyi) supports common media formats:
              </p>
              <ul>
                <li><strong>Images:</strong> JPG, PNG, GIF, WebP</li>
                <li><strong>Audio:</strong> MP3, WAV, OGG, M4A</li>
                <li><strong>Video:</strong> MP4, WebM, MOV (small files only)</li>
              </ul>
            </div>

            <div className="faq-item">
              <h3>How much storage do I get per CD?</h3>
              <p>
                Each CD has a 20 MB capacity—just like the real thing! This is enough for about 20-30 photos, 
                4-5 songs, or a mix of different media types.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Sharing Your CDs</h2>
            
            <div className="faq-item">
              <h3>How do I share a CD?</h3>
              <p>
                1. Open the CD you want to share<br />
                2. Click the "Share" button<br />
                3. Choose to send via email or copy a shareable link<br />
                4. Your recipient can view the CD without signing up
              </p>
            </div>

            <div className="faq-item">
              <h3>How long do shared links last?</h3>
              <p>
                Shared CDs remain accessible for 30 days from the date of sharing. After that, 
                the link expires and recipients can no longer access the content.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can recipients download my files?</h3>
              <p>
                Yes! Recipients can download individual files or download the entire CD as a ZIP file. 
                This makes it easy to save memories locally.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Managing Your Collection</h2>
            
            <div className="faq-item">
              <h3>How many CDs can I create?</h3>
              <p>
                There's no limit! Create as many CDs as you want. Each one gets its own 20 MB of storage.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I edit a CD after creating it?</h3>
              <p>
                Yes! You can add or remove files, change the CD title, and update the description at any time. 
                Changes are reflected immediately for anyone with access to the CD.
              </p>
            </div>

            <div className="faq-item">
              <h3>How do I delete a CD?</h3>
              <p>
                Open the CD, click the menu button (⋮), and select "Delete CD". This will permanently remove 
                the CD and all its files. This action cannot be undone.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Technical Issues</h2>
            
            <div className="faq-item">
              <h3>My upload is stuck or failing</h3>
              <p>
                Try these troubleshooting steps:
              </p>
              <ul>
                <li>Check your internet connection</li>
                <li>Make sure the file is under 20 MB</li>
                <li>Verify the file format is supported</li>
                <li>Try refreshing the page and uploading again</li>
                <li>Clear your browser cache and cookies</li>
              </ul>
            </div>

            <div className="faq-item">
              <h3>I can't log in to my account</h3>
              <p>
                If you're having trouble logging in:
              </p>
              <ul>
                <li>Double-check your email and password</li>
                <li>Use the "Forgot Password" link to reset your password</li>
                <li>Make sure cookies are enabled in your browser</li>
                <li>Try a different browser or device</li>
              </ul>
            </div>

            <div className="faq-item">
              <h3>The burning animation is laggy</h3>
              <p>
                Animations may be slower on older devices. You can disable animations in your browser's 
                accessibility settings (look for "prefers-reduced-motion"). The functionality will work 
                the same, just without the visual effects.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Account & Billing</h2>
            
            <div className="faq-item">
              <h3>Is ReCd(fyi) free?</h3>
              <p>
                Yes! ReCd(fyi) is completely free to use. Create unlimited CDs, upload files, and share 
                with friends—no credit card required.
              </p>
            </div>

            <div className="faq-item">
              <h3>How do I delete my account?</h3>
              <p>
                Go to Settings → Account → Delete Account. This will permanently remove your account, 
                all your CDs, and all uploaded files. This action cannot be undone.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Still Need Help?</h2>
            <p>
              Can't find the answer you're looking for? We're here to help!
            </p>
            <p>
              <strong>Email us:</strong> <a href="mailto:info@vinamrasharma.com">info@vinamrasharma.com</a>
            </p>
            <p>
              I typically respond within 24 hours.
            </p>
          </section>
        </div>

        <footer className="info-footer">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </footer>
      </div>
    </div>
  );
}
