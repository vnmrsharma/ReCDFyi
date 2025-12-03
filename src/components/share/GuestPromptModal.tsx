/**
 * Guest Prompt Modal - Encourages guests to sign up or continue as guest
 */

import { Link } from 'react-router-dom';
import './ShareComponents.css';

interface GuestPromptModalProps {
  isOpen: boolean;
  onContinueAsGuest: () => void;
  cdName: string;
}

export function GuestPromptModal({ isOpen, onContinueAsGuest, cdName }: GuestPromptModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content guest-prompt-modal">
        <div className="modal-header">
          <div className="guest-prompt-icon">💿</div>
          <h2 className="modal-title">Welcome to ReCd(fyi)!</h2>
        </div>

        <div className="modal-body">
          <p className="guest-prompt-message">
            You're about to view <strong>"{cdName}"</strong>
          </p>
          
          <div className="guest-prompt-benefits">
            <h3>Sign up for free to:</h3>
            <ul>
              <li>✨ Create your own virtual CDs</li>
              <li>📧 Share memories with friends</li>
              <li>💾 Store up to 20 MB per CD</li>
              <li>🎨 Enjoy the full Y2K experience</li>
            </ul>
          </div>

          <div className="guest-prompt-actions">
            <Link to="/auth" className="button button-primary button-large">
              Sign Up Free
            </Link>
            <button 
              className="button button-secondary button-large"
              onClick={onContinueAsGuest}
            >
              Continue as Guest
            </button>
          </div>

          <p className="guest-prompt-note">
            As a guest, you can view this shared CD but won't be able to create your own.
          </p>
        </div>
      </div>
    </div>
  );
}
