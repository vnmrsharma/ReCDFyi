/**
 * Main application component with routing configuration
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CDProvider } from './contexts/CDContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PublicRoute } from './components/routing/PublicRoute';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CollectionPage } from './pages/CollectionPage';
import { CDDetailPage } from './pages/CDDetailPage';
import { SharedCDPage } from './pages/SharedCDPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { PublicCDViewPage } from './pages/PublicCDViewPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { HelpPage } from './pages/HelpPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './App.css';

/**
 * Root application component with routing and context providers
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CDProvider>
          <Routes>
            {/* Landing page - public */}
            <Route path="/" element={<LandingPage />} />

            {/* Info pages - public */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Public auth route - redirects to collection if authenticated */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/collection"
              element={
                <ProtectedRoute>
                  <CollectionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cd/:cdId"
              element={
                <ProtectedRoute>
                  <CDDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Public shared CD route - no authentication required */}
            <Route path="/shared/:token" element={<SharedCDPage />} />

            {/* Public marketplace route - no authentication required */}
            <Route path="/marketplace" element={<MarketplacePage />} />

            {/* Public CD view route - no authentication required */}
            <Route path="/marketplace/:cdId" element={<PublicCDViewPage />} />

            {/* Creator profile route - no authentication required */}
            <Route path="/profile/:username" element={<CreatorProfilePage />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CDProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
