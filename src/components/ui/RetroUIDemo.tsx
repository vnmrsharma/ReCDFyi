/**
 * RetroUIDemo component
 * Demo page to showcase retro UI components
 * This is for development/testing purposes
 */

import { useState } from 'react';
import { RetroLayout } from './RetroLayout';
import { RetroButton } from './RetroButton';
import { DiscAnimation } from './DiscAnimation';
import { LoadingSpinner } from './LoadingSpinner';

export function RetroUIDemo() {
  const [showInsert, setShowInsert] = useState(false);
  const [showEject, setShowEject] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <RetroLayout>
      <div style={{ padding: '24px' }}>
        <h1>ReCd(fyi) - Retro UI Components Demo</h1>
        
        <div className="retro-panel" style={{ marginBottom: '16px' }}>
          <h2>Buttons</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <RetroButton variant="primary" size="small">Small Primary</RetroButton>
            <RetroButton variant="primary" size="medium">Medium Primary</RetroButton>
            <RetroButton variant="primary" size="large">Large Primary</RetroButton>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <RetroButton variant="secondary">Secondary</RetroButton>
            <RetroButton variant="danger">Danger</RetroButton>
            <RetroButton disabled>Disabled</RetroButton>
          </div>
        </div>

        <div className="retro-panel" style={{ marginBottom: '16px' }}>
          <h2>Disc Animations</h2>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <RetroButton onClick={() => setShowInsert(true)}>
              Show Insert Animation
            </RetroButton>
            <RetroButton onClick={() => setShowEject(true)}>
              Show Eject Animation
            </RetroButton>
          </div>
        </div>

        <div className="retro-panel" style={{ marginBottom: '16px' }}>
          <h2>Loading Spinner</h2>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <RetroButton onClick={() => setShowSpinner(!showSpinner)}>
              Toggle Spinner
            </RetroButton>
          </div>
          {showSpinner && (
            <div style={{ marginTop: '16px' }}>
              <LoadingSpinner size="small" message="Loading small..." />
              <LoadingSpinner size="medium" message="Loading medium..." />
              <LoadingSpinner size="large" message="Loading large..." />
            </div>
          )}
        </div>

        <div className="retro-window" style={{ padding: '16px' }}>
          <div className="retro-title-bar">
            <span>Window Title</span>
            <span>×</span>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--text-white)' }}>
            <p>This is a retro window with a title bar.</p>
            <p>It uses the Y2K aesthetic with 3D borders and classic styling.</p>
          </div>
        </div>
      </div>

      {showInsert && (
        <DiscAnimation 
          type="insert" 
          onComplete={() => setShowInsert(false)} 
        />
      )}
      
      {showEject && (
        <DiscAnimation 
          type="eject" 
          onComplete={() => setShowEject(false)} 
        />
      )}
    </RetroLayout>
  );
}
