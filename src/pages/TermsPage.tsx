/**
 * Terms of Service page
 */

import { Link } from 'react-router-dom';
import './InfoPages.css';

export function TermsPage() {
  return (
    <div className="info-page">
      <div className="info-container">
        <header className="info-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: December 3, 2025</p>
        </header>

        <div className="info-content">
          <section className="info-section">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using ReCd(fyi), you agree to be bound by these Terms of Service and our Privacy Policy. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="info-section">
            <h2>Description of Service</h2>
            <p>
              ReCd(fyi) is a virtual CD burning and sharing platform that allows users to:
            </p>
            <ul>
              <li>Create virtual CDs with up to 20 MB of storage each</li>
              <li>Upload media files (images, audio, video)</li>
              <li>Share CDs via email or shareable links</li>
              <li>Access shared CDs without requiring an account</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
            </p>
          </section>

          <section className="info-section">
            <h2>Account Registration</h2>
            <p>To use ReCd(fyi), you must:</p>
            <ul>
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p>
              You are responsible for all activity that occurs under your account. We are not liable for any loss 
              or damage arising from your failure to maintain account security.
            </p>
          </section>

          <section className="info-section">
            <h2>Acceptable Use</h2>
            <p>You agree NOT to use ReCd(fyi) to:</p>
            <ul>
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Violate any intellectual property rights</li>
              <li>Upload malware, viruses, or malicious code</li>
              <li>Harass, threaten, or harm others</li>
              <li>Impersonate any person or entity</li>
              <li>Spam or send unsolicited communications</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use automated tools to access the service without permission</li>
              <li>Upload content that violates any law or regulation</li>
            </ul>
            <p>
              We reserve the right to remove content and terminate accounts that violate these terms.
            </p>
          </section>

          <section className="info-section">
            <h2>Content Ownership and License</h2>
            
            <h3>Your Content</h3>
            <p>
              You retain all ownership rights to the content you upload. By uploading content to ReCd(fyi), 
              you grant us a limited license to:
            </p>
            <ul>
              <li>Store your files on our servers</li>
              <li>Display your content to you and users you share with</li>
              <li>Process and optimize files for delivery</li>
              <li>Create backups for service reliability</li>
            </ul>
            <p>
              This license ends when you delete your content or account.
            </p>

            <h3>Responsibility for Content</h3>
            <p>
              You are solely responsible for the content you upload. You represent and warrant that:
            </p>
            <ul>
              <li>You own or have the right to upload all content</li>
              <li>Your content does not violate any third-party rights</li>
              <li>Your content complies with all applicable laws</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Storage Limits and File Retention</h2>
            <ul>
              <li>Each CD has a maximum capacity of 20 MB</li>
              <li>There is no limit to the number of CDs you can create</li>
              <li>Shared links expire after 30 days</li>
              <li>We reserve the right to delete inactive accounts after 12 months of inactivity</li>
              <li>We may implement additional storage limits in the future with notice</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Prohibited Content</h2>
            <p>You may not upload content that:</p>
            <ul>
              <li>Contains child sexual abuse material</li>
              <li>Promotes violence, terrorism, or hate speech</li>
              <li>Infringes copyright, trademark, or other intellectual property rights</li>
              <li>Contains private information of others without consent</li>
              <li>Is pornographic or sexually explicit</li>
              <li>Promotes illegal activities</li>
              <li>Contains malware or harmful code</li>
            </ul>
            <p>
              Violations will result in immediate content removal and may result in account termination 
              and reporting to law enforcement.
            </p>
          </section>

          <section className="info-section">
            <h2>Copyright and DMCA</h2>
            <p>
              We respect intellectual property rights. If you believe content on ReCd(fyi) infringes your 
              copyright, please contact us with:
            </p>
            <ul>
              <li>Description of the copyrighted work</li>
              <li>Location of the infringing content (URL)</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief</li>
              <li>A statement under penalty of perjury that the information is accurate</li>
              <li>Your physical or electronic signature</li>
            </ul>
            <p>
              <strong>DMCA Contact:</strong> <a href="mailto:dmca@recd.fyi">dmca@recd.fyi</a>
            </p>
          </section>

          <section className="info-section">
            <h2>Service Availability</h2>
            <p>
              We strive to provide reliable service, but we do not guarantee:
            </p>
            <ul>
              <li>Uninterrupted or error-free operation</li>
              <li>That defects will be corrected</li>
              <li>That the service is free from viruses or harmful components</li>
              <li>That your content will never be lost or corrupted</li>
            </ul>
            <p>
              We recommend keeping backups of important files. We are not responsible for any data loss.
            </p>
          </section>

          <section className="info-section">
            <h2>Termination</h2>
            
            <h3>By You</h3>
            <p>
              You may delete your account at any time through your account settings. This will permanently 
              remove all your data.
            </p>

            <h3>By Us</h3>
            <p>
              We may suspend or terminate your account if you:
            </p>
            <ul>
              <li>Violate these Terms of Service</li>
              <li>Upload prohibited content</li>
              <li>Engage in abusive behavior</li>
              <li>Attempt to compromise service security</li>
            </ul>
            <p>
              We will provide notice when possible, but reserve the right to terminate immediately for 
              serious violations.
            </p>
          </section>

          <section className="info-section">
            <h2>Disclaimer of Warranties</h2>
            <p>
              ReCd(fyi) is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express 
              or implied, including but not limited to:
            </p>
            <ul>
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or reliability</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ReCd(fyi) and its operators shall not be liable for:
            </p>
            <ul>
              <li>Any indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruptions or data loss</li>
              <li>Unauthorized access to your account</li>
              <li>Third-party content or conduct</li>
            </ul>
            <p>
              Our total liability shall not exceed $100 or the amount you paid us in the past 12 months, 
              whichever is greater.
            </p>
          </section>

          <section className="info-section">
            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless ReCd(fyi) from any claims, damages, or expenses 
              (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use of the service</li>
              <li>Your content</li>
              <li>Your violation of these terms</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the United States, without regard to conflict 
              of law provisions. Any disputes shall be resolved in the courts located in the United States.
            </p>
          </section>

          <section className="info-section">
            <h2>Changes to Terms</h2>
            <p>
              We may update these Terms of Service at any time. We will notify you of significant changes 
              by posting a notice on our website or sending an email. Your continued use after changes are 
              posted constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="info-section">
            <h2>Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will 
              continue in full force and effect.
            </p>
          </section>

          <section className="info-section">
            <h2>Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:legal@recd.fyi">legal@recd.fyi</a>
            </p>
          </section>
        </div>

        <footer className="info-footer">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy</Link>
        </footer>
      </div>
    </div>
  );
}
