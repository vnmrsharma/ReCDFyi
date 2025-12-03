/**
 * Share service for managing share tokens and CD sharing
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ShareToken, CD } from '../types';
import { COLLECTIONS, DEFAULT_TOKEN_EXPIRATION_DAYS, ERROR_MESSAGES } from '../utils/constants';
import { generateToken, isValidTokenFormat } from '../utils/tokenGenerator';

/**
 * Generates a unique share token for a CD
 * @param cdId - The CD ID to generate a token for
 * @param userId - The user ID creating the share token
 * @param expirationDays - Number of days until token expires (default: 30)
 * @returns Promise resolving to the created ShareToken
 * @throws {Error} If token generation fails or CD doesn't exist
 */
export async function generateShareToken(
  cdId: string,
  userId: string,
  expirationDays: number = DEFAULT_TOKEN_EXPIRATION_DAYS
): Promise<ShareToken> {
  try {
    // Verify CD exists and user owns it
    const cdRef = doc(db, COLLECTIONS.CDS, cdId);
    const cdSnap = await getDoc(cdRef);
    
    if (!cdSnap.exists()) {
      throw new Error(ERROR_MESSAGES.CD_NOT_FOUND);
    }
    
    const cdData = cdSnap.data();
    if (cdData.userId !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
    
    // Generate unique token (check for collisions)
    let token: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!isUnique && attempts < maxAttempts) {
      token = generateToken();
      
      // Check if token already exists
      const tokensRef = collection(db, COLLECTIONS.SHARE_TOKENS);
      const q = query(tokensRef, where('token', '==', token));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      throw new Error('Failed to generate unique token after multiple attempts');
    }
    
    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);
    
    // Create share token document
    const tokenRef = doc(collection(db, COLLECTIONS.SHARE_TOKENS));
    const shareTokenData = {
      token: token!,
      cdId,
      createdBy: userId,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      accessCount: 0,
    };
    
    await setDoc(tokenRef, shareTokenData);
    
    // Return ShareToken object
    return {
      id: tokenRef.id,
      token: token!,
      cdId,
      createdBy: userId,
      createdAt: now,
      expiresAt,
      accessCount: 0,
    };
  } catch (error) {
    console.error('Error generating share token:', error);
    throw error;
  }
}

/**
 * Validates a share token and returns the associated CD ID
 * @param token - The share token to validate
 * @returns Promise resolving to validation result with cdId if valid
 */
export async function validateShareToken(
  token: string
): Promise<{ valid: boolean; cdId?: string; tokenId?: string }> {
  try {
    // Validate token format
    if (!isValidTokenFormat(token)) {
      return { valid: false };
    }
    
    // Query for token in Firestore
    const tokensRef = collection(db, COLLECTIONS.SHARE_TOKENS);
    const q = query(tokensRef, where('token', '==', token));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { valid: false };
    }
    
    // Get the first (and should be only) matching token
    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();
    
    // Check if token is expired
    const now = new Date();
    const expiresAt = tokenData.expiresAt.toDate();
    
    if (expiresAt < now) {
      return { valid: false };
    }
    
    // Token is valid
    return {
      valid: true,
      cdId: tokenData.cdId,
      tokenId: tokenDoc.id,
    };
  } catch (error) {
    console.error('Error validating share token:', error);
    return { valid: false };
  }
}

/**
 * Retrieves a CD using a valid share token
 * @param token - The share token
 * @returns Promise resolving to the CD data and validation info
 * @throws {Error} If token is invalid or CD doesn't exist
 */
export async function getSharedCD(token: string): Promise<CD & { tokenValid: boolean }> {
  try {
    // Validate token first
    const validation = await validateShareToken(token);
    
    if (!validation.valid || !validation.cdId) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }
    
    // Get the token document to access CD data
    const tokensRef = collection(db, COLLECTIONS.SHARE_TOKENS);
    const q = query(tokensRef, where('token', '==', token));
    const tokenSnapshot = await getDocs(q);
    
    if (tokenSnapshot.empty) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }
    
    const tokenDoc = tokenSnapshot.docs[0];
    const tokenData = tokenDoc.data();
    
    // Increment access count
    await updateDoc(tokenDoc.ref, {
      accessCount: increment(1),
    });
    
    // Retrieve CD - Since we validated the token, we can access the CD data
    // The security rules allow access through shareTokens collection
    const cdRef = doc(db, COLLECTIONS.CDS, validation.cdId);
    const cdSnap = await getDoc(cdRef);
    
    if (!cdSnap.exists()) {
      throw new Error(ERROR_MESSAGES.CD_NOT_FOUND);
    }
    
    const cdData = cdSnap.data();
    
    return {
      id: cdSnap.id,
      userId: cdData.userId,
      username: cdData.username || '',
      name: cdData.name,
      label: cdData.label,
      createdAt: cdData.createdAt.toDate(),
      updatedAt: cdData.updatedAt.toDate(),
      storageUsedBytes: cdData.storageUsedBytes,
      storageLimitBytes: cdData.storageLimitBytes,
      fileCount: cdData.fileCount,
      isPublic: cdData.isPublic || false,
      publicAt: cdData.publicAt?.toDate() || undefined,
      viewCount: cdData.viewCount || 0,
      tokenValid: true,
    };
  } catch (error: any) {
    console.error('Error getting shared CD:', error);
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Unable to access this CD. The share link may have expired or been revoked.');
    }
    throw error;
  }
}

/**
 * Gets all share tokens created by a user for a specific CD
 * @param cdId - The CD ID
 * @param userId - The user ID
 * @returns Promise resolving to array of ShareTokens
 */
export async function getCDShareTokens(cdId: string, userId: string): Promise<ShareToken[]> {
  try {
    const tokensRef = collection(db, COLLECTIONS.SHARE_TOKENS);
    const q = query(
      tokensRef,
      where('cdId', '==', cdId),
      where('createdBy', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        token: data.token,
        cdId: data.cdId,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        expiresAt: data.expiresAt.toDate(),
        accessCount: data.accessCount,
      };
    });
  } catch (error) {
    console.error('Error getting CD share tokens:', error);
    throw error;
  }
}

/**
 * Gets file metadata for a shared CD using a valid token
 * This bypasses normal auth requirements by validating the share token first
 * @param cdId - The CD ID
 * @param token - The share token
 * @returns Promise resolving to array of MediaFile metadata
 * @throws {Error} If token is invalid or file retrieval fails
 */
export async function getSharedCDFiles(cdId: string, token: string): Promise<any[]> {
  try {
    // Validate token first
    const validation = await validateShareToken(token);
    
    if (!validation.valid || validation.cdId !== cdId) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }
    
    // Access files through the validated token
    // Since the token is valid, we can access the files
    const filesCollectionRef = collection(db, COLLECTIONS.CDS, cdId, COLLECTIONS.FILES);
    const querySnapshot = await getDocs(filesCollectionRef);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        cdId: data.cdId,
        filename: data.filename,
        originalName: data.originalName,
        fileType: data.fileType,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        storagePath: data.storagePath,
        uploadedAt: data.uploadedAt?.toDate ? data.uploadedAt.toDate() : new Date(),
        thumbnailPath: data.thumbnailPath,
      };
    });
  } catch (error: any) {
    console.error('Error getting shared CD files:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Unable to access files for this CD. The share link may have expired.');
    }
    throw error;
  }
}
