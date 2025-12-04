/**
 * Public CD service for managing public marketplace operations
 * Handles public CD toggling, browsing, searching, and analytics
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateCDVisibility } from './cdService';
import type { PublicCD, MarketplaceQueryOptions } from '../types';
import { COLLECTIONS, ERROR_MESSAGES, MARKETPLACE_PAGE_SIZE } from '../utils/constants';

/**
 * Converts Firestore document data to PublicCD type
 */
function mapFirestoreToPublicCD(id: string, data: any): PublicCD {
  return {
    id,
    userId: data.userId,
    username: data.username,
    name: data.name,
    label: data.label || undefined,
    fileCount: data.fileCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    publicAt: data.publicAt?.toDate() || new Date(),
    viewCount: data.viewCount || 0,
    thumbnailUrl: data.thumbnailUrl || undefined,
  };
}

/**
 * Syncs a CD to the publicCDs collection (denormalized for performance)
 * @param cdId - ID of the CD to sync
 * @param cdData - CD data from the main cds collection
 */
async function syncPublicCD(cdId: string, cdData: any): Promise<void> {
  try {
    const publicCDRef = doc(db, COLLECTIONS.PUBLIC_CDS, cdId);
    
    await setDoc(publicCDRef, {
      cdId,
      userId: cdData.userId,
      username: cdData.username,
      name: cdData.name,
      label: cdData.label || null,
      fileCount: cdData.fileCount || 0,
      createdAt: cdData.createdAt,
      publicAt: cdData.publicAt || serverTimestamp(),
      viewCount: cdData.viewCount || 0,
      thumbnailUrl: cdData.thumbnailUrl || null,
    });
  } catch (error: any) {
    console.error('Error syncing public CD:', error);
    throw new Error(`Failed to sync public CD: ${error.message}`);
  }
}

/**
 * Removes a CD from the publicCDs collection
 * @param cdId - ID of the CD to remove
 */
async function removePublicCD(cdId: string): Promise<void> {
  try {
    const publicCDRef = doc(db, COLLECTIONS.PUBLIC_CDS, cdId);
    await deleteDoc(publicCDRef);
  } catch (error: any) {
    console.error('Error removing public CD:', error);
    throw new Error(`Failed to remove public CD: ${error.message}`);
  }
}

/**
 * Toggles a CD between public and private visibility
 * @param cdId - ID of the CD to toggle
 * @param userId - ID of the user performing the toggle (must be owner)
 * @param isPublic - New public status
 * @returns Promise that resolves when toggle is complete
 * @throws {Error} If toggle fails or user is not the owner
 */
export async function toggleCDPublic(
  cdId: string,
  userId: string,
  isPublic: boolean
): Promise<void> {
  try {
    const cdRef = doc(db, COLLECTIONS.CDS, cdId);
    const cdSnap = await getDoc(cdRef);

    if (!cdSnap.exists()) {
      throw new Error(ERROR_MESSAGES.CD_NOT_FOUND);
    }

    const cdData = cdSnap.data();
    
    // Verify ownership
    if (cdData.userId !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // If making public, ensure CD has username
    let username = cdData.username;
    if (isPublic) {
      // If CD doesn't have username, fetch it from user document
      if (!username) {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          throw new Error('User document not found');
        }
        
        const userData = userSnap.data();
        username = userData.username;
        
        if (!username) {
          throw new Error('You must set a username before making CDs public. Please complete your profile setup.');
        }
        
        // Update the CD with the username
        await updateDoc(cdRef, { username });
      }
    }

    // Update CD visibility using cdService
    await updateCDVisibility(cdId, userId, isPublic);

    // Sync with publicCDs collection
    if (isPublic) {
      // Fetch updated document to get server timestamp
      const updatedSnap = await getDoc(cdRef);
      const updatedData = updatedSnap.data();
      
      // Ensure we have all required fields
      if (!updatedData) {
        throw new Error('Failed to fetch updated CD data');
      }
      
      await syncPublicCD(cdId, updatedData);
    } else {
      // Remove from publicCDs collection
      await removePublicCD(cdId);
    }
  } catch (error: any) {
    console.error('Error toggling CD public status:', error);
    if (
      error.message === ERROR_MESSAGES.CD_NOT_FOUND ||
      error.message === ERROR_MESSAGES.UNAUTHORIZED ||
      error.message.includes('username')
    ) {
      throw error;
    }
    // Preserve the original error message for debugging
    throw new Error(`${ERROR_MESSAGES.PUBLIC_TOGGLE_FAILED}: ${error.message}`);
  }
}

/**
 * Retrieves public CDs with sorting and pagination
 * @param options - Query options for sorting, pagination, and filtering
 * @returns Promise resolving to array of public CDs
 * @throws {Error} If retrieval fails
 */
export async function getPublicCDs(
  options: MarketplaceQueryOptions = {}
): Promise<PublicCD[]> {
  try {
    const {
      sortBy = 'newest',
      limit = MARKETPLACE_PAGE_SIZE,
      startAfter,
      creatorUsername,
    } = options;

    let q = query(collection(db, COLLECTIONS.PUBLIC_CDS));

    // Filter by creator if specified
    if (creatorUsername) {
      q = query(q, where('username', '==', creatorUsername));
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        q = query(q, orderBy('publicAt', 'desc'));
        break;
      case 'oldest':
        q = query(q, orderBy('publicAt', 'asc'));
        break;
      case 'mostViewed':
        q = query(q, orderBy('viewCount', 'desc'));
        break;
    }

    // Apply pagination
    q = query(q, firestoreLimit(limit));

    if (startAfter) {
      // TODO: Implement cursor-based pagination with startAfter document
      // This requires passing the last document snapshot, not just an ID
    }

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => mapFirestoreToPublicCD(doc.id, doc.data()));
  } catch (error: any) {
    console.error('Error fetching public CDs:', error);
    throw new Error(ERROR_MESSAGES.MARKETPLACE_LOAD_FAILED);
  }
}

/**
 * Retrieves a single public CD by ID
 * @param cdId - ID of the public CD to retrieve
 * @returns Promise resolving to the public CD
 * @throws {Error} If CD not found or not public
 */
export async function getPublicCD(cdId: string): Promise<PublicCD> {
  try {
    const publicCDRef = doc(db, COLLECTIONS.PUBLIC_CDS, cdId);
    const publicCDSnap = await getDoc(publicCDRef);

    if (!publicCDSnap.exists()) {
      throw new Error(ERROR_MESSAGES.PUBLIC_CD_NOT_FOUND);
    }

    return mapFirestoreToPublicCD(publicCDSnap.id, publicCDSnap.data());
  } catch (error: any) {
    if (error.message === ERROR_MESSAGES.PUBLIC_CD_NOT_FOUND) {
      throw error;
    }
    throw new Error(`Failed to retrieve public CD: ${error.message}`);
  }
}

/**
 * Retrieves all public CDs created by a specific user
 * @param username - Username of the creator
 * @returns Promise resolving to array of public CDs
 * @throws {Error} If retrieval fails
 */
export async function getCreatorPublicCDs(username: string): Promise<PublicCD[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.PUBLIC_CDS),
      where('username', '==', username),
      orderBy('publicAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => mapFirestoreToPublicCD(doc.id, doc.data()));
  } catch (error: any) {
    console.error('Error fetching creator public CDs:', error);
    throw new Error(`Failed to retrieve creator's public CDs: ${error.message}`);
  }
}

/**
 * Searches public CDs by name (case-insensitive matching)
 * @param searchQuery - Search query to match against CD names
 * @returns Promise resolving to array of matching public CDs
 * @throws {Error} If search fails
 */
export async function searchPublicCDs(searchQuery: string): Promise<PublicCD[]> {
  try {
    // Firestore doesn't support case-insensitive or partial text search natively
    // We'll fetch all public CDs and filter client-side
    // For production, consider using Algolia or similar search service
    
    const q = query(
      collection(db, COLLECTIONS.PUBLIC_CDS),
      orderBy('publicAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const allPublicCDs = querySnapshot.docs.map((doc) => 
      mapFirestoreToPublicCD(doc.id, doc.data())
    );

    // Filter by name (case-insensitive)
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    if (!lowerQuery) {
      return allPublicCDs;
    }

    return allPublicCDs.filter((cd) =>
      cd.name.toLowerCase().includes(lowerQuery)
    );
  } catch (error: any) {
    console.error('Error searching public CDs:', error);
    throw new Error(ERROR_MESSAGES.SEARCH_FAILED);
  }
}
