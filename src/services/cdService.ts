/**
 * CD service for managing virtual CD operations
 * Handles CD creation, retrieval, updates, and deletion
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CD } from '../types';
import { COLLECTIONS, MAX_STORAGE_BYTES, ERROR_MESSAGES } from '../utils/constants';
import { validateShareToken } from './shareService';

/**
 * Converts Firestore document data to CD type
 */
function mapFirestoreToCD(id: string, data: any): CD {
  return {
    id,
    userId: data.userId,
    username: data.username || '', // Default empty for backward compatibility
    name: data.name,
    label: data.label,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    storageUsedBytes: data.storageUsedBytes || 0,
    storageLimitBytes: data.storageLimitBytes || MAX_STORAGE_BYTES,
    fileCount: data.fileCount || 0,
    isPublic: data.isPublic || false, // Default to private
    publicAt: data.publicAt?.toDate() || undefined,
    viewCount: data.viewCount || 0,
  };
}

/**
 * Verifies that a user is the owner of a CD
 * @param cdId - ID of the CD to check
 * @param userId - ID of the user to verify
 * @returns Promise resolving to true if user is owner, false otherwise
 */
async function verifyOwnership(cdId: string, userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.CDS, cdId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return false;
    }
    
    const cdData = docSnap.data();
    return cdData.userId === userId;
  } catch (error) {
    console.error('Error verifying ownership:', error);
    return false;
  }
}

/**
 * Verifies access to a CD - either through ownership or valid share token
 * @param cdId - ID of the CD to check
 * @param userId - ID of the user (optional for guest access)
 * @param shareToken - Share token for guest access (optional)
 * @returns Promise resolving to true if access is granted, false otherwise
 */
export async function verifyAccess(
  cdId: string,
  userId?: string,
  shareToken?: string
): Promise<boolean> {
  try {
    // Check ownership first if userId is provided
    if (userId) {
      const isOwner = await verifyOwnership(cdId, userId);
      if (isOwner) {
        return true;
      }
    }
    
    // Check share token if provided
    if (shareToken) {
      const validation = await validateShareToken(shareToken);
      if (validation.valid && validation.cdId === cdId) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying access:', error);
    return false;
  }
}

/**
 * Creates a new virtual CD
 * @param userId - ID of the user creating the CD
 * @param name - Name of the CD
 * @param label - Optional label/description for the CD
 * @returns Promise resolving to the created CD
 * @throws {Error} If CD creation fails
 */
export async function createCD(
  userId: string,
  name: string,
  label?: string
): Promise<CD> {
  try {
    const cdData = {
      userId,
      name,
      label: label || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      storageUsedBytes: 0,
      storageLimitBytes: MAX_STORAGE_BYTES,
      fileCount: 0,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.CDS), cdData);
    
    // Fetch the created document to get server-generated timestamps
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Failed to retrieve created CD');
    }

    return mapFirestoreToCD(docRef.id, docSnap.data());
  } catch (error: any) {
    throw new Error(`Failed to create CD: ${error.message}`);
  }
}

/**
 * Retrieves all CDs for a specific user, sorted by creation date (newest first)
 * @param userId - ID of the user
 * @returns Promise resolving to array of CDs
 * @throws {Error} If retrieval fails
 */
export async function getUserCDs(userId: string): Promise<CD[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.CDS),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    const cds = querySnapshot.docs.map((doc) => mapFirestoreToCD(doc.id, doc.data()));
    
    // Sort client-side by createdAt (newest first) to avoid needing a composite index
    return cds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error: any) {
    throw new Error(`Failed to retrieve CDs: ${error.message}`);
  }
}

/**
 * Retrieves a specific CD by ID with access control
 * @param cdId - ID of the CD to retrieve
 * @param userId - ID of the user requesting access (optional for guest access)
 * @param shareToken - Share token for guest access (optional)
 * @returns Promise resolving to the CD
 * @throws {Error} If CD not found, access denied, or retrieval fails
 */
export async function getCD(cdId: string, userId?: string, shareToken?: string): Promise<CD> {
  try {
    const docRef = doc(db, COLLECTIONS.CDS, cdId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(ERROR_MESSAGES.CD_NOT_FOUND);
    }

    // Verify access control
    const hasAccess = await verifyAccess(cdId, userId, shareToken);
    if (!hasAccess) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return mapFirestoreToCD(docSnap.id, docSnap.data());
  } catch (error: any) {
    if (error.message === ERROR_MESSAGES.CD_NOT_FOUND || error.message === ERROR_MESSAGES.UNAUTHORIZED) {
      throw error;
    }
    throw new Error(`Failed to retrieve CD: ${error.message}`);
  }
}

/**
 * Updates the storage usage for a CD (owner only)
 * @param cdId - ID of the CD to update
 * @param userId - ID of the user performing the update
 * @param usedBytes - New storage usage in bytes
 * @returns Promise that resolves when update is complete
 * @throws {Error} If update fails or user is not the owner
 */
export async function updateCDStorage(cdId: string, userId: string, usedBytes: number): Promise<void> {
  try {
    // Verify ownership
    const isOwner = await verifyOwnership(cdId, userId);
    if (!isOwner) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
    
    const docRef = doc(db, COLLECTIONS.CDS, cdId);
    
    await updateDoc(docRef, {
      storageUsedBytes: usedBytes,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
      throw error;
    }
    throw new Error(`Failed to update CD storage: ${error.message}`);
  }
}

/**
 * Deletes a CD and all its associated data (owner only)
 * @param cdId - ID of the CD to delete
 * @param userId - ID of the user performing the deletion
 * @returns Promise that resolves when deletion is complete
 * @throws {Error} If deletion fails or user is not the owner
 */
export async function deleteCD(cdId: string, userId: string): Promise<void> {
  try {
    // Verify ownership
    const isOwner = await verifyOwnership(cdId, userId);
    if (!isOwner) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
    
    const docRef = doc(db, COLLECTIONS.CDS, cdId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
      throw error;
    }
    throw new Error(`Failed to delete CD: ${error.message}`);
  }
}
