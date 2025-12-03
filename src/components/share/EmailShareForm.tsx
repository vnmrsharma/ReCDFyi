/**
 * EmailShareForm component
 * Form for entering recipient email and sending share link via email
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { validateEmail } from '../../services/validationService';
import { ERROR_MESSAGES } from '../../utils/constants';
import './ShareComponents.css';

interface EmailShareFormProps {
  cdName: string;
  onSendEmail: (recipientEmail: string, customMessage?: string) => Promise<void>;
}

export function EmailShareForm({ cdName, onSendEmail }: EmailShareFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate email
    const isValid = validateEmail(email);
    if (!isValid) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    setSending(true);
    try {
      await onSendEmail(email, message || undefined);
      setSuccess(true);
      setEmail('');
      setMessage('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-share-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient-email" className="form-label">
            Recipient Email
          </label>
          <input
            id="recipient-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            disabled={sending}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-message" className="form-label">
            Personal Message (Optional)
          </label>
          <textarea
            id="custom-message"
            className="form-input form-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to your friend..."
            disabled={sending}
            rows={3}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Email sent successfully!</div>}

        <button
          type="submit"
          className="send-button retro-button"
          disabled={sending || !email}
        >
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      <p className="email-info">
        Share "{cdName}" with a friend via email
      </p>
    </div>
  );
}
