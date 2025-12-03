/**
 * Marketplace page for browsing public CDs
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RetroLayout } from '../components/ui/RetroLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PublicCDCard } from '../components/cd/PublicCDCard';
import { MarketplaceFilters } from '../components/cd/MarketplaceFilters';
import { MarketplaceEmpty } from '../components/cd/MarketplaceEmpty';
import { getPublicCDs } from '../services/publicCDService';
import { useAuth } from '../hooks/useAuth';
import type { PublicCD, MarketplaceQueryOptions } from '../types';
import './pages.css';
import '../components/cd/marketplace.css';

/**
 * Page component for browsing the public CD marketplace
 */
export function MarketplacePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [publicCDs, setPublicCDs] = useState<PublicCD[]>([]);
  const [filteredCDs, setFilteredCDs] = useState<PublicCD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostViewed'>('newest');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load initial public CDs
  useEffect(() => {
    loadPublicCDs();
  }, []);

  // Filter and sort CDs when search or sort changes
  useEffect(() => {
    filterAndSortCDs();
  }, [publicCDs, searchQuery, sortBy]);

  const loadPublicCDs = async () => {
    try {
      setLoading(true);
      setError(null);
      const options: MarketplaceQueryOptions = {
        sortBy: 'newest',
        limit: 20,
      };
      const cds = await getPublicCDs(options);
      setPublicCDs(cds);
      setHasMore(cds.length === 20);
    } catch (err) {
      console.error('Failed to load public CDs:', err);
      setError('Failed to load marketplace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCDs = async () => {
    if (loadingMore || !hasMore || searchQuery) return;

    try {
      setLoadingMore(true);
      const lastCD = publicCDs[publicCDs.length - 1];
      const options: MarketplaceQueryOptions = {
        sortBy: 'newest',
        limit: 20,
        startAfter: lastCD.id,
      };
      const moreCDs = await getPublicCDs(options);
      setPublicCDs((prev) => [...prev, ...moreCDs]);
      setHasMore(moreCDs.length === 20);
    } catch (err) {
      console.error('Failed to load more CDs:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filterAndSortCDs = () => {
    let result = [...publicCDs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((cd) =>
        cd.name.toLowerCase().includes(query) ||
        cd.username.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.publicAt.getTime() - a.publicAt.getTime();
        case 'oldest':
          return a.publicAt.getTime() - b.publicAt.getTime();
        case 'mostViewed':
          return b.viewCount - a.viewCount;
        default:
          return 0;
      }
    });

    setFilteredCDs(result);
  };

  const handleCDClick = (cd: PublicCD) => {
    navigate(`/marketplace/${cd.id}`);
  };

  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore || searchQuery) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 500) {
      loadMoreCDs();
    }
  }, [loadingMore, hasMore, searchQuery]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <RetroLayout>
      <div className="marketplace-page">
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
                      className="nav-link active"
                      onClick={() => navigate('/marketplace')}
                    >
                      Marketplace
                    </button>
                    <button
                      className="nav-link"
                      onClick={() => navigate('/settings')}
                    >
                      Settings
                    </button>
                  </nav>
                  {user.username && (
                    <button
                      className="nav-link username-link"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      @{user.username}
                    </button>
                  )}
                  <button className="button button-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <>
                  <nav className="header-nav">
                    <button
                      className="nav-link active"
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
          <div className="marketplace-container">
            <PageHeader
              title="CD Marketplace"
              subtitle={
                searchQuery.trim()
                  ? `Searching for "${searchQuery}" • Sorted by ${sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Most Viewed'}`
                  : `Browse and download media collections shared by the community • Sorted by ${sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Most Viewed'}`
              }
              icon="🎵"
            />

            <MarketplaceFilters
              searchQuery={searchQuery}
              sortBy={sortBy}
              onSearchChange={setSearchQuery}
              onSortChange={setSortBy}
            />

            {loading ? (
              <LoadingSpinner size="large" message="Loading marketplace..." />
            ) : error ? (
              <div className="error-state" role="alert">
                <div className="error-state__icon">⚠️</div>
                <h2 className="error-state__title">Failed to Load Marketplace</h2>
                <p className="error-state__message">{error}</p>
                <div className="error-state__actions">
                  <button className="button button-primary" onClick={loadPublicCDs}>
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredCDs.length === 0 ? (
              <MarketplaceEmpty hasSearch={!!searchQuery.trim()} />
            ) : (
              <>
                <div className="marketplace-grid">
                  {filteredCDs.map((cd) => (
                    <PublicCDCard key={cd.id} cd={cd} onClick={handleCDClick} />
                  ))}
                </div>

                {loadingMore && (
                  <div className="loading-more">
                    <LoadingSpinner size="small" message="Loading more..." />
                  </div>
                )}

                {!hasMore && !searchQuery && publicCDs.length > 0 && (
                  <div className="end-message">
                    <p>You've reached the end of the marketplace</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </RetroLayout>
  );
}
