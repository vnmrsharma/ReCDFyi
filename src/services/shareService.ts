/**
 * Share service for managing share tokens and CD sharing
 *
 * Share token document IDs are the secret token strings. Guests get one document
 * by ID (knowing the link). Collection listing is owner-only, so tokens cannot
 * be scraped. Guest CD/file access uses a snapshot stored on the token so private
 * CDs stay locked in the cds/ collection.
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
import type {
  ShareToken,
  CD,
  MediaFile,
  ShareTokenCDSnapshot,
  ShareTokenFileSnapshot,
} from '../types';
import { COLLECTIONS, DEFAULT_TOKEN_EXPIRATION_DAYS, ERROR_MESSAGES } from '../utils/constants';
import { generateToken, isValidTokenFormat } from '../utils/tokenGenerator';
import { getFileMetadata, getFileDownloadURL } from './fileService';

/**
 * Builds a guest-readable snapshot of CD + file download URLs for a share token
 */
async function buildShareSnapshot(
  cdId: string,
  cdData: Record<string, any>
): Promise<{ cdSnapshot: ShareTokenCDSnapshot; filesSnapshot: ShareTokenFileSnapshot[] }> {
  const files = await getFileMetadata(cdId);

  const filesSnapshot: ShareTokenFileSnapshot[] = await Promise.all(
    files.map(async (file) => {
      let downloadURL = '';
      try {
        downloadURL = await getFileDownloadURL(file.storagePath);
      } catch (error) {
        console.warn(`Could not create download URL for ${file.originalName}:`, error);
      }

      return {
        id: file.id,
        cdId: file.cdId,
        filename: file.filename,
        originalName: file.originalName,
        fileType: file.fileType,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        storagePath: file.storagePath,
        uploadedAt: file.uploadedAt,
        thumbnailPath: file.thumbnailPath,
        downloadURL,
      };
    })
  );

  const cdSnapshot: ShareTokenCDSnapshot = {
    name: cdData.name,
    username: cdData.username || '',
    label: cdData.label,
    fileCount: cdData.fileCount || filesSnapshot.length,
    storageUsedBytes: cdData.storageUsedBytes || 0,
    storageLimitBytes: cdData.storageLimitBytes || 0,
    isPublic: cdData.isPublic || false,
    createdAt: cdData.createdAt?.toDate ? cdData.createdAt.toDate() : new Date(),
    updatedAt: cdData.updatedAt?.toDate ? cdData.updatedAt.toDate() : new Date(),
  };

  return { cdSnapshot, filesSnapshot };
}

function mapSnapshotFile(file: ShareTokenFileSnapshot): MediaFile {
  return {
    id: file.id,
    cdId: file.cdId,
    filename: file.filename,
    originalName: file.originalName,
    fileType: file.fileType,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    storagePath: file.storagePath,
    uploadedAt:
      file.uploadedAt instanceof Date
        ? file.uploadedAt
        : (file.uploadedAt as any)?.toDate
          ? (file.uploadedAt as any).toDate()
          : new Date(file.uploadedAt),
    thumbnailPath: file.thumbnailPath,
    downloadURL: file.downloadURL,
  };
}

/**
 * Generates a unique share token for a CD
 * @param cdId - The CD ID to generate a token for
 * @param userId - The user ID creating the share token
 * @param expirationDays - Number of days until token expires (default: 30)
 * @returns Promise resolving to the created ShareToken
 */
export async function generateShareToken(
  cdId: string,
  userId: string,
  expirationDays: number = DEFAULT_TOKEN_EXPIRATION_DAYS
): Promise<ShareToken> {
  try {
    const cdRef = doc(db, COLLECTIONS.CDS, cdId);
    const cdSnap = await getDoc(cdRef);

    if (!cdSnap.exists()) {
      throw new Error(ERROR_MESSAGES.CD_NOT_FOUND);
    }

    const cdData = cdSnap.data();
    if (cdData.userId !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    let token = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      token = generateToken();
      const existing = await getDoc(doc(db, COLLECTIONS.SHARE_TOKENS, token));
      if (!existing.exists()) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique token after multiple attempts');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);
    const { cdSnapshot, filesSnapshot } = await buildShareSnapshot(cdId, cdData);

    const tokenRef = doc(db, COLLECTIONS.SHARE_TOKENS, token);
    const shareTokenData = {
      token,
      cdId,
      createdBy: userId,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      accessCount: 0,
      cdSnapshot: {
        ...cdSnapshot,
        createdAt: Timestamp.fromDate(cdSnapshot.createdAt),
        updatedAt: Timestamp.fromDate(cdSnapshot.updatedAt),
      },
      filesSnapshot: filesSnapshot.map((file) => ({
        ...file,
        uploadedAt: Timestamp.fromDate(
          file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt)
        ),
      })),
    };

    await setDoc(tokenRef, shareTokenData);

    return {
      id: token,
      token,
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
 */
export async function validateShareToken(
  token: string
): Promise<{ valid: boolean; cdId?: string; tokenId?: string }> {
  try {
    if (!isValidTokenFormat(token)) {
      return { valid: false };
    }

    const tokenSnap = await getDoc(doc(db, COLLECTIONS.SHARE_TOKENS, token));
    if (!tokenSnap.exists()) {
      return { valid: false };
    }

    const tokenData = tokenSnap.data();
    const expiresAt = tokenData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return { valid: false };
    }

    return {
      valid: true,
      cdId: tokenData.cdId,
      tokenId: tokenSnap.id,
    };
  } catch (error) {
    console.error('Error validating share token:', error);
    return { valid: false };
  }
}

/**
 * Retrieves a CD using a valid share token (from the token snapshot)
 */
export async function getSharedCD(token: string): Promise<CD & { tokenValid: boolean }> {
  try {
    if (!isValidTokenFormat(token)) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }

    const tokenRef = doc(db, COLLECTIONS.SHARE_TOKENS, token);
    const tokenSnap = await getDoc(tokenRef);

    if (!tokenSnap.exists()) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }

    const tokenData = tokenSnap.data();
    const expiresAt = tokenData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_EXPIRED);
    }

    try {
      await updateDoc(tokenRef, {
        accessCount: increment(1),
      });
    } catch (error) {
      console.warn('Could not increment share token access count:', error);
    }

    const snapshot = tokenData.cdSnapshot;
    if (!snapshot) {
      throw new Error(
        'This share link was created before a security update. Please ask the owner to create a new share link.'
      );
    }

    return {
      id: tokenData.cdId,
      userId: tokenData.createdBy,
      username: snapshot.username || '',
      name: snapshot.name,
      label: snapshot.label,
      createdAt: snapshot.createdAt?.toDate ? snapshot.createdAt.toDate() : new Date(),
      updatedAt: snapshot.updatedAt?.toDate ? snapshot.updatedAt.toDate() : new Date(),
      storageUsedBytes: snapshot.storageUsedBytes || 0,
      storageLimitBytes: snapshot.storageLimitBytes || 0,
      fileCount: snapshot.fileCount || 0,
      isPublic: snapshot.isPublic || false,
      viewCount: 0,
      tokenValid: true,
    };
  } catch (error: any) {
    console.error('Error getting shared CD:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Unable to access this CD. The share link may have expired or been revoked.');
    }
    throw error;
  }
}

/**
 * Gets all share tokens created by a user for a specific CD
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

    return querySnapshot.docs.map((tokenDoc) => {
      const data = tokenDoc.data();
      return {
        id: tokenDoc.id,
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
 * Gets file metadata for a shared CD from the token snapshot
 */
export async function getSharedCDFiles(cdId: string, token: string): Promise<MediaFile[]> {
  try {
    if (!isValidTokenFormat(token)) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }

    const tokenSnap = await getDoc(doc(db, COLLECTIONS.SHARE_TOKENS, token));
    if (!tokenSnap.exists()) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }

    const tokenData = tokenSnap.data();
    if (tokenData.cdId !== cdId) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
    }

    const expiresAt = tokenData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      throw new Error(ERROR_MESSAGES.SHARE_TOKEN_EXPIRED);
    }

    const filesSnapshot = tokenData.filesSnapshot;
    if (!Array.isArray(filesSnapshot)) {
      throw new Error(
        'This share link was created before a security update. Please ask the owner to create a new share link.'
      );
    }

    return filesSnapshot.map(mapSnapshotFile);
  } catch (error: any) {
    console.error('Error getting shared CD files:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Unable to access files for this CD. The share link may have expired.');
    }
    throw error;
  }
}
