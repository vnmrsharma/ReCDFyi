/**
 * Collection view component for displaying all user CDs
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CDCard } from './CDCard';
import { CreateCDModal } from './CreateCDModal';
import { EmptyState } from '../ui/EmptyState';
import { EmptyDiscIcon } from '../ui/EmptyDiscIcon';
import { useCDs } from '../../contexts/CDContext';
import type { CD } from '../../types';
import './CDComponents.css';

export interface CDCollectionProps {
  hideHeader?: boolean;
}

/**
 * Displays a grid of CD cards with create functionality
 */
export function CDCollection({ hideHeader = false }: CDCollectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cds, loading, error } = useCDs();
  const navigate = useNavigate();

  const handleCDClick = (cd: CD) => {
    navigate(`/cd/${cd.id}`);
  };

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="cd-collection-container">
        {!hideHeader && (
          <div className="collection-header">
            <h1>My CDs</h1>
          </div>
        )}
        <div className="loading-state">
          <div className="loading-spinner" aria-label="Loading CDs">
            <svg viewBox="0 0 100 100" className="spinner-disc">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#0066FF"
                strokeWidth="8"
                strokeDasharray="60 200"
              />
            </svg>
          </div>
          <p>Loading your CDs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cd-collection-container">
        {!hideHeader && (
          <div className="collection-header">
            <h1>My CDs</h1>
          </div>
        )}
        <div className="error-state" role="alert">
          <p className="error-message">{error}</p>
          <button className="button button-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-collection-container">
      {!hideHeader && (
        <div className="collection-header">
          <h1>My CDs</h1>
          <button
            className="button button-primary"
            onClick={handleCreateClick}
            aria-label="Create new CD"
          >
            + Create New CD
          </button>
        </div>
      )}

      {cds.length === 0 ? (
        <EmptyState
          icon={<EmptyDiscIcon />}
          title="No CDs Yet"
          message="Create your first virtual CD to start sharing media with friends!"
          action={
            <button className="button button-primary button-large" onClick={handleCreateClick}>
              Create Your First CD
            </button>
          }
        />
      ) : (
        <div className="cd-grid">
          {cds.map((cd) => (
            <CDCard key={cd.id} cd={cd} onClick={handleCDClick} />
          ))}
        </div>
      )}

      {!hideHeader && (
        <CreateCDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
