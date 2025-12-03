/**
 * ShareButton component
 * Button that opens the share modal and handles share actions
 */

import { useState } from 'react';
import { ShareModal } from './ShareModal';
import type { CD } from '../../types';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';

interface ShareButtonProps {
  cd: CD;
  userId: string;
  onSendEmail: (recipientEmail: string, shareUrl: string, customMessage?: string) => Promise<void>;
  className?: string;
}

export function ShareButton({ cd, userId, onSendEmail, className }: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendEmail = async (recipientEmail: string, shareUrl: string, customMessage?: string) => {
    try {
      await onSendEmail(recipientEmail, shareUrl, customMessage);
      showSuccess('Email sent successfully!');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to send email');
      throw error; // Re-throw so EmailShareForm can handle it
    }
  };

  const handleCopyLink = () => {
    showSuccess('Link copied to clipboard!');
  };

  return (
    <>
      <button className={className || 'share-button retro-button'} onClick={handleOpenModal}>
        Share
      </button>

      <ShareModal
        cd={cd}
        userId={userId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSendEmail={handleSendEmail}
        onCopyLink={handleCopyLink}
      />

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}
