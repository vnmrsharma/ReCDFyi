/**
 * Privacy Policy page
 */

import { Link } from 'react-router-dom';
import './InfoPages.css';

export function PrivacyPage() {
  return (
    <div className="info-page">
      <div className="info-container">
        <header className="info-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: December 3, 2025</p>
        </header>

        <div className="info-content">
          <section className="info-section">
            <h2>Introduction</h2>
            <p>
              At ReCd(fyi), we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              and protect your personal information when you use our virtual CD burning and sharing platform.
            </p>
            <p>
              By using ReCd(fyi), you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="info-section">
            <h2>Information We Collect</h2>
            
            <h3>Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
              <li>Email address</li>
              <li>Password (encrypted and never stored in plain text)</li>
              <li>Account creation date</li>
            </ul>

            <h3>Content You Upload</h3>
            <p>When you use ReCd(fyi), we store:</p>
            <ul>
              <li>Media files you upload (images, audio, video)</li>
              <li>CD titles and descriptions</li>
              <li>File metadata (names, sizes, upload dates)</li>
            </ul>

            <h3>Usage Information</h3>
            <p>We automatically collect certain information about how you use our service:</p>
            <ul>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Pages visited and features used</li>
              <li>Date and time of access</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain the ReCd(fyi) service</li>
              <li>Authenticate your account and prevent unauthorized access</li>
              <li>Store and deliver your uploaded media files</li>
              <li>Send you service-related emails (password resets, share notifications)</li>
              <li>Improve our service and develop new features</li>
              <li>Monitor usage patterns and troubleshoot technical issues</li>
              <li>Ensure compliance with our Terms of Service</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>How We Share Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information only in the following circumstances:
            </p>
            
            <h3>With Your Consent</h3>
            <p>
              When you share a CD, recipients can view the files you've chosen to share. You control what 
              gets shared and with whom.
            </p>

            <h3>Service Providers</h3>
            <p>
              We use trusted third-party services to operate ReCd(fyi):
            </p>
            <ul>
              <li><strong>Firebase (Google):</strong> Authentication, database, and file storage</li>
              <li><strong>Vercel:</strong> Web hosting and content delivery</li>
            </ul>
            <p>
              These providers are bound by strict data protection agreements and only process data on our behalf.
            </p>

            <h3>Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or government regulation, 
              or if we believe disclosure is necessary to:
            </p>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Protect our rights or property</li>
              <li>Prevent fraud or abuse</li>
              <li>Protect the safety of users or the public</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul>
              <li>All data transmitted between your browser and our servers is encrypted using HTTPS/TLS</li>
              <li>Passwords are hashed using bcrypt before storage</li>
              <li>Firebase Security Rules enforce access control at the database level</li>
              <li>Regular security audits and updates</li>
              <li>Secure authentication tokens with automatic expiration</li>
            </ul>
            <p>
              However, no method of transmission over the internet is 100% secure. While we strive to protect 
              your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="info-section">
            <h2>Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide services:</p>
            <ul>
              <li><strong>Account data:</strong> Retained until you delete your account</li>
              <li><strong>Uploaded files:</strong> Retained until you delete the CD or your account</li>
              <li><strong>Shared links:</strong> Expire automatically after 30 days</li>
              <li><strong>Usage logs:</strong> Retained for up to 90 days for troubleshooting</li>
            </ul>
            <p>
              When you delete your account, we permanently remove all your data within 30 days, except where 
              we're required by law to retain certain information.
            </p>
          </section>

          <section className="info-section">
            <h2>Your Rights</h2>
            <p>You have the following rights regarding your personal data:</p>
            
            <h3>Access</h3>
            <p>You can access your account information and uploaded content at any time through your account dashboard.</p>

            <h3>Correction</h3>
            <p>You can update your email address and other account information in your account settings.</p>

            <h3>Deletion</h3>
            <p>
              You can delete individual CDs, files, or your entire account at any time. Deletion is permanent 
              and cannot be undone.
            </p>

            <h3>Data Portability</h3>
            <p>You can download all your uploaded files at any time as ZIP archives.</p>

            <h3>Opt-Out</h3>
            <p>You can opt out of non-essential emails in your account settings.</p>
          </section>

          <section className="info-section">
            <h2>Cookies and Tracking</h2>
            <p>
              ReCd(fyi) uses essential cookies to maintain your login session and remember your preferences. 
              We do not use third-party advertising or tracking cookies.
            </p>
            <p>
              You can disable cookies in your browser settings, but this may affect your ability to use certain 
              features of the service.
            </p>
          </section>

          <section className="info-section">
            <h2>Children's Privacy</h2>
            <p>
              ReCd(fyi) is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected information from a child under 13, 
              please contact us immediately and we will delete the information.
            </p>
          </section>

          <section className="info-section">
            <h2>International Users</h2>
            <p>
              ReCd(fyi) is hosted in the United States. If you access our service from outside the UK, your 
              information may be transferred to, stored, and processed in the U.S or UK. By using ReCd(fyi), you consent 
              to this transfer.
            </p>
          </section>

          <section className="info-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by 
              posting a notice on our website or sending you an email. Your continued use of ReCd(fyi) after 
              changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="info-section">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:info@vinamrasharma.com">info@vinamrasharma.com</a>
            </p>
          </section>
        </div>

        <footer className="info-footer">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/help">Help</Link>
          <Link to="/terms">Terms</Link>
        </footer>
      </div>
    </div>
  );
}
