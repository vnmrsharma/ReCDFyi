/**
 * Analytics service for tracking CD view analytics
 * Handles recording views and retrieving analytics data
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ViewAnalytics, ViewRecord } from '../types';
import { COLLECTIONS, ANALYTICS_PAGE_SIZE, ERROR_MESSAGES } from '../utils/constants';

/**
 * Records a view for a public CD by a logged-in user
 * Only records the first view per user to maintain unique viewer count
 * @param cdId - ID of the CD being viewed
 * @param viewerUserId - ID of the user viewing the CD
 * @param viewerUsername - Username of the viewer
 * @returns Promise that resolves when view is recorded
 * @throws {Error} If recording fails
 */
export async function recordView(
  cdId: string,
  viewerUserId: string,
  viewerUsername: string
): Promise<void> {
  try {
    // Check if user has already viewed this CD
    const hasViewed = await hasUserViewed(cdId, viewerUserId);
    
    if (hasViewed) {
      // User has already viewed, don't record again
      return;
    }

    // Ensure the parent cdViews document exists (required for subcollection access)
    const cdViewsDocRef = doc(db, COLLECTIONS.CD_VIEWS, cdId);
    const cdViewsDoc = await getDoc(cdViewsDocRef);
    
    if (!cdViewsDoc.exists()) {
      // Create parent document with minimal data
      await setDoc(cdViewsDocRef, {
        cdId,
        createdAt: serverTimestamp(),
      });
    }

    // Create view record in cdViews/{cdId}/viewers/{viewerUserId}
    const viewerDocRef = doc(db, COLLECTIONS.CD_VIEWS, cdId, 'viewers', viewerUserId);
    
    await setDoc(viewerDocRef, {
      cdId,
      viewerUserId,
      viewerUsername,
      viewedAt: serverTimestamp(),
      viewCount: 1,
    });

    // Increment the view count on the CD document
    const cdDocRef = doc(db, COLLECTIONS.CDS, cdId);
    await updateDoc(cdDocRef, {
      viewCount: increment(1),
    });

    // Also update the publicCDs collection if it exists
    const publicCDDocRef = doc(db, COLLECTIONS.PUBLIC_CDS, cdId);
    const publicCDDoc = await getDoc(publicCDDocRef);
    
    if (publicCDDoc.exists()) {
      await updateDoc(publicCDDocRef, {
        viewCount: increment(1),
      });
    }
  } catch (error: any) {
    console.error('Error recording view:', error);
    throw new Error(`Failed to record view: ${error.message}`);
  }
}

/**
 * Retrieves view analytics for a CD including viewer list and stats
 * @param cdId - ID of the CD
 * @param maxViewers - Maximum number of viewers to retrieve (default: ANALYTICS_PAGE_SIZE)
 * @returns Promise resolving to ViewAnalytics with viewer list and stats
 * @throws {Error} If retrieval fails
 */
export async function getViewAnalytics(
  cdId: string,
  maxViewers: number = ANALYTICS_PAGE_SIZE
): Promise<ViewAnalytics> {
  try {
    // Get all viewers for this CD
    const viewersCollectionRef = collection(db, COLLECTIONS.CD_VIEWS, cdId, 'viewers');
    const q = query(
      viewersCollectionRef,
      orderBy('viewedAt', 'desc'),
      limit(maxViewers)
    );

    const querySnapshot = await getDocs(q);
    
    const viewers: ViewRecord[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        username: data.viewerUsername,
        viewedAt: data.viewedAt?.toDate() || new Date(),
        viewCount: data.viewCount || 1,
      };
    });

    // Get total view count from CD document
    const totalViews = await getViewCount(cdId);

    return {
      totalViews,
      uniqueViewers: viewers.length,
      viewers,
    };
  } catch (error: any) {
    console.error('Error getting view analytics:', error);
    throw new Error(ERROR_MESSAGES.ANALYTICS_LOAD_FAILED);
  }
}

/**
 * Gets the total view count for a CD
 * @param cdId - ID of the CD
 * @returns Promise resolving to the view count
 * @throws {Error} If retrieval fails
 */
export async function getViewCount(cdId: string): Promise<number> {
  try {
    const cdDocRef = doc(db, COLLECTIONS.CDS, cdId);
    const cdDoc = await getDoc(cdDocRef);

    if (!cdDoc.exists()) {
      return 0;
    }

    const data = cdDoc.data();
    return data.viewCount || 0;
  } catch (error: any) {
    console.error('Error getting view count:', error);
    return 0;
  }
}

/**
 * Checks if a user has already viewed a specific CD
 * @param cdId - ID of the CD
 * @param userId - ID of the user to check
 * @returns Promise resolving to true if user has viewed, false otherwise
 */
export async function hasUserViewed(cdId: string, userId: string): Promise<boolean> {
  try {
    const viewerDocRef = doc(db, COLLECTIONS.CD_VIEWS, cdId, 'viewers', userId);
    const viewerDoc = await getDoc(viewerDocRef);

    return viewerDoc.exists();
  } catch (error: any) {
    console.error('Error checking if user viewed:', error);
    return false;
  }
}
