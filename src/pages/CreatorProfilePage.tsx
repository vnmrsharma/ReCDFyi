/**
 * Creator profile page showing user's public CDs and stats
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RetroLayout } from '../components/ui/RetroLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PublicCDCard } from '../components/cd/PublicCDCard';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import type { UserProfile, PublicCD } from '../types';
import './pages.css';
import '../components/cd/marketplace.css';

/**
 * Page component for viewing a creator's profile and their CDs
 */
export function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if viewing own profile
  const isOwnProfile = user?.username === username;

  useEffect(() => {
    if (!username) {
      setError('Invalid profile URL');
      setLoading(false);
      return;
    }

    loadProfile();
  }, [username, user?.uid]);

  const loadProfile = async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(username, user?.uid);
      setProfile(profileData);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      if (err.message === 'User not found') {
        setError('User not found. This profile may not exist.');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCDClick = (cd: PublicCD) => {
    if (isOwnProfile) {
      // Navigate to owned CD detail page
      navigate(`/cd/${cd.id}`);
    } else {
      // Navigate to public CD view
      navigate(`/marketplace/${cd.id}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <RetroLayout>
      <div className="creator-profile-page">
        <header className="page-header">
          <div className="header-content">
            <h1 className="app-title">ReCd(fyi)</h1>
            <div className="header-actions">
              {user && (
                <>
                  <nav className="header-nav">
                    <button
                      className="nav-link"
                      onClick={() => navigate('/collection')}
                    >
                      My CDs
                    </button>
                    <button
                      className="nav-link"
                      onClick={() => navigate('/marketplace')}
                    >
                      Marketplace
                    </button>
                  </nav>
                  <span className="user-email">{user.email}</span>
                  <button className="button button-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <>
                  <nav className="header-nav">
                    <button
                      className="nav-link"
                      onClick={() => navigate('/marketplace')}
                    >
                      Marketplace
                    </button>
                  </nav>
                  <button
                    className="button button-primary"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          {loading ? (
            <LoadingSpinner size="large" message="Loading profile..." />
          ) : error ? (
            <div className="error-state" role="alert">
              <div className="error-state__icon">👤</div>
              <h2 className="error-state__title">Profile Not Found</h2>
              <p className="error-state__message">{error}</p>
              <div className="error-state__actions">
                <button
                  className="button button-primary"
                  onClick={() => navigate('/marketplace')}
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          ) : profile ? (
            <div className="profile-container">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-avatar">
                  <svg viewBox="0 0 100 100" className="avatar-disc">
                    <circle cx="50" cy="50" r="45" fill="#0066FF" />
                    <circle cx="50" cy="50" r="15" fill="#C0C0C0" />
                    <text
                      x="50"
                      y="55"
                      textAnchor="middle"
                      fill="white"
                      fontSize="24"
                      fontWeight="bold"
                    >
                      {profile.username.charAt(0).toUpperCase()}
                    </text>
                  </svg>
                </div>
                <div className="profile-info">
                  <h1 className="profile-username">@{profile.username}</h1>
                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-label">Joined:</span>
                      <span className="stat-value">{formatDate(profile.joinDate)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Public CDs:</span>
                      <span className="stat-value">{profile.publicCDCount}</span>
                    </div>
                    {isOwnProfile && (
                      <div className="stat-item">
                        <span className="stat-label">Total CDs:</span>
                        <span className="stat-value">{profile.publicCDs.length}</span>
                      </div>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="profile-actions">
                      <button
                        className="button button-primary"
                        onClick={() => navigate('/collection')}
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CDs Section */}
              <div className="profile-cds-section">
                <h2 className="section-title">
                  {isOwnProfile ? 'My CDs' : `${profile.username}'s Public CDs`}
                </h2>
                
                {profile.publicCDs.length === 0 ? (
                  <div className="empty-state">
                    <p>
                      {isOwnProfile
                        ? "You haven't created any CDs yet. Start sharing your media!"
                        : `${profile.username} hasn't shared any public CDs yet.`}
                    </p>
                    {isOwnProfile && (
                      <button
                        className="button button-primary"
                        onClick={() => navigate('/collection')}
                        style={{ marginTop: '16px' }}
                      >
                        Create Your First CD
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="marketplace-grid">
                    {profile.publicCDs.map((cd) => (
                      <PublicCDCard
                        key={cd.id}
                        cd={cd}
                        onClick={handleCDClick}
                        showPrivateBadge={isOwnProfile && !cd.publicAt}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </RetroLayout>
  );
}
