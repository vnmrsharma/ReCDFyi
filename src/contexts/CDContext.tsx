/**
 * CD Context for managing CD state across the application
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CD } from '../types';
import { getUserCDs } from '../services/cdService';
import { useAuth } from '../hooks/useAuth';

interface CDContextType {
  cds: CD[];
  loading: boolean;
  error: string | null;
  refreshCDs: () => Promise<void>;
  addCD: (cd: CD) => void;
  updateCD: (cdId: string, updates: Partial<CD>) => void;
  removeCD: (cdId: string) => void;
}

const CDContext = createContext<CDContextType | undefined>(undefined);

interface CDProviderProps {
  children: ReactNode;
}

/**
 * Provider component for CD state management
 */
export function CDProvider({ children }: CDProviderProps) {
  const [cds, setCDs] = useState<CD[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Fetches CDs for the current user
   */
  const refreshCDs = async () => {
    if (!user) {
      setCDs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userCDs = await getUserCDs(user.uid);
      setCDs(userCDs);
    } catch (err: any) {
      setError(err.message || 'Failed to load CDs');
      setCDs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new CD to the local state
   */
  const addCD = (cd: CD) => {
    setCDs((prevCDs) => [cd, ...prevCDs]);
  };

  /**
   * Updates a CD in the local state
   */
  const updateCD = (cdId: string, updates: Partial<CD>) => {
    setCDs((prevCDs) =>
      prevCDs.map((cd) =>
        cd.id === cdId ? { ...cd, ...updates, updatedAt: new Date() } : cd
      )
    );
  };

  /**
   * Removes a CD from the local state
   */
  const removeCD = (cdId: string) => {
    setCDs((prevCDs) => prevCDs.filter((cd) => cd.id !== cdId));
  };

  // Load CDs when user changes
  useEffect(() => {
    refreshCDs();
  }, [user]);

  const value: CDContextType = {
    cds,
    loading,
    error,
    refreshCDs,
    addCD,
    updateCD,
    removeCD,
  };

  return <CDContext.Provider value={value}>{children}</CDContext.Provider>;
}

/**
 * Hook to access CD context
 * @throws {Error} If used outside CDProvider
 */
export function useCDs(): CDContextType {
  const context = useContext(CDContext);
  if (context === undefined) {
    throw new Error('useCDs must be used within a CDProvider');
  }
  return context;
}
