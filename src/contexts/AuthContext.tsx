/**
 * Authentication context for global auth state management
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import type { User } from '../types';
import * as authService from '../services/authService';
import { UsernamePromptModal } from '../components/auth/UsernamePromptModal';
import { generateUsernameFromEmail } from '../services/validationService';
import { setUsernameDuringMigration } from '../services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsUsername: boolean;
  signUp: (email: string, password: string, username: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state
 * Provides auth context to all child components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [suggestedUsername, setSuggestedUsername] = useState('');

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Load additional user data from Firestore
        try {
          const userDocRef = doc(db, COLLECTIONS.USERS, authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if user needs to set a username (migration)
            if (!userData.username) {
              setNeedsUsername(true);
              setSuggestedUsername(generateUsernameFromEmail(authUser.email || ''));
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                username: undefined,
                displayName: userData.displayName,
                publicCDCount: 0,
              });
            } else {
              setNeedsUsername(false);
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                username: userData.username,
                displayName: userData.displayName,
                publicCDCount: userData.publicCDCount || 0,
              });
            }
          } else {
            // Fallback if user document doesn't exist (shouldn't happen)
            setUser(authUser);
            setNeedsUsername(false);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(authUser);
          setNeedsUsername(false);
        }
      } else {
        setUser(null);
        setNeedsUsername(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const handleUsernameSubmit = async (username: string) => {
    if (!user) return;

    try {
      await setUsernameDuringMigration(user.uid, username);
      
      // Update local user state
      setUser({
        ...user,
        username,
        publicCDCount: 0,
      });
      setNeedsUsername(false);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to set username');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    needsUsername,
    signUp: authService.signUp,
    login: authService.login,
    logout: authService.logout,
    resetPassword: authService.resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {needsUsername && user && (
        <UsernamePromptModal
          suggestedUsername={suggestedUsername}
          onSubmit={handleUsernameSubmit}
        />
      )}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 * @returns AuthContext value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
