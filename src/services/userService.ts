/**
 * User service for managing user profiles and data
 * Handles user profile retrieval and username operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserProfile, PublicCD } from '../types';
import { COLLECTIONS } from '../utils/constants';
import { getCreatorPublicCDs } from './publicCDService';
import { getUserCDs } from './cdService';

/**
 * Retrieves a user by their username
 * @param username - Username to look up
 * @returns Promise resolving to the User or null if not found
 * @throws {Error} If retrieval fails
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const usernameL = username.toLowerCase();
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('usernameL', '==', usernameL)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    return {
      uid: userDoc.id,
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName || undefined,
      publicCDCount: userData.publicCDCount || 0,
    };
  } catch (error: any) {
    console.error('Error fetching user by username:', error);
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
}

/**
 * Retrieves a user's profile including their public CDs
 * @param username - Username of the profile to retrieve
 * @param currentUserId - ID of the currently logged-in user (optional)
 * @returns Promise resolving to the UserProfile
 * @throws {Error} If user not found or retrieval fails
 */
export async function getUserProfile(
  username: string,
  currentUserId?: string
): Promise<UserProfile> {
  try {
    const user = await getUserByUsername(username);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if viewing own profile
    const isOwnProfile = currentUserId === user.uid;

    let cds: PublicCD[];
    
    if (isOwnProfile) {
      // Show all CDs for own profile (convert CD[] to PublicCD[])
      const allCDs = await getUserCDs(user.uid);
      cds = allCDs.map(cd => ({
        id: cd.id,
        userId: cd.userId,
        username: cd.username,
        name: cd.name,
        label: cd.label,
        fileCount: cd.fileCount,
        createdAt: cd.createdAt,
        publicAt: cd.publicAt || cd.createdAt, // Use createdAt as fallback
        viewCount: cd.viewCount,
        thumbnailUrl: undefined,
      }));
    } else {
      // Show only public CDs for other profiles
      cds = await getCreatorPublicCDs(username);
    }

    // Get user document to fetch join date
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    const userData = userDoc.data();
    const joinDate = userData?.createdAt?.toDate() || new Date();

    return {
      username: user.username!,
      joinDate,
      publicCDCount: cds.filter(cd => cd.publicAt).length,
      publicCDs: cds,
    };
  } catch (error: any) {
    if (error.message === 'User not found') {
      throw error;
    }
    console.error('Error fetching user profile:', error);
    throw new Error(`Failed to retrieve user profile: ${error.message}`);
  }
}

/**
 * Updates a user's username and all references across the system
 * @param userId - ID of the user updating their username
 * @param oldUsername - Current username
 * @param newUsername - New username to set
 * @returns Promise resolving when update is complete
 * @throws {Error} If update fails or username is invalid/taken
 */
export async function updateUsername(
  userId: string,
  oldUsername: string,
  newUsername: string
): Promise<void> {
  try {
    const normalizedOld = oldUsername.toLowerCase();
    const normalizedNew = newUsername.toLowerCase();

    // Update user document
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      username: newUsername,
      usernameL: normalizedNew,
    });

    // Update username document (delete old, create new)
    const oldUsernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedOld);
    const newUsernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedNew);
    
    await deleteDoc(oldUsernameRef);
    await setDoc(newUsernameRef, {
      userId,
      username: newUsername,
      createdAt: new Date(),
    });

    // Update all CDs owned by this user
    const cdsRef = collection(db, COLLECTIONS.CDS);
    const q = query(cdsRef, where('userId', '==', userId));
    const cdsSnapshot = await getDocs(q);

    const updatePromises = cdsSnapshot.docs.map(cdDoc => 
      updateDoc(doc(db, COLLECTIONS.CDS, cdDoc.id), {
        username: newUsername,
      })
    );

    await Promise.all(updatePromises);

    // Update publicCDs collection for public CDs
    const publicCDsRef = collection(db, COLLECTIONS.PUBLIC_CDS);
    const publicQuery = query(publicCDsRef, where('userId', '==', userId));
    const publicSnapshot = await getDocs(publicQuery);

    const publicUpdatePromises = publicSnapshot.docs.map(publicDoc =>
      updateDoc(doc(db, COLLECTIONS.PUBLIC_CDS, publicDoc.id), {
        username: newUsername,
      })
    );

    await Promise.all(publicUpdatePromises);

    // Update view analytics (cdViews subcollection)
    // Note: This updates the viewerUsername field in all view records
    const cdViewsRef = collection(db, COLLECTIONS.CD_VIEWS);
    const viewsSnapshot = await getDocs(cdViewsRef);

    const viewUpdatePromises: Promise<void>[] = [];
    
    for (const cdViewDoc of viewsSnapshot.docs) {
      const viewersRef = collection(db, COLLECTIONS.CD_VIEWS, cdViewDoc.id, 'viewers');
      const viewersQuery = query(viewersRef, where('viewerUserId', '==', userId));
      const viewersSnapshot = await getDocs(viewersQuery);

      viewersSnapshot.docs.forEach(viewerDoc => {
        viewUpdatePromises.push(
          updateDoc(doc(db, COLLECTIONS.CD_VIEWS, cdViewDoc.id, 'viewers', viewerDoc.id), {
            viewerUsername: newUsername,
          })
        );
      });
    }

    await Promise.all(viewUpdatePromises);
  } catch (error: any) {
    console.error('Error updating username:', error);
    throw new Error(`Failed to update username: ${error.message}`);
  }
}

/**
 * Sets username for an existing user during migration
 * Creates username document and updates user document
 * @param userId - ID of the user setting their username
 * @param username - Username to set
 * @returns Promise resolving when username is set
 * @throws {Error} If setting username fails
 */
export async function setUsernameDuringMigration(
  userId: string,
  username: string
): Promise<void> {
  try {
    const normalizedUsername = username.toLowerCase();

    // Create or update user document (use setDoc with merge to create if doesn't exist)
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      username,
      usernameL: normalizedUsername,
      publicCDCount: 0, // Initialize public CD count
      createdAt: new Date(), // Will only be set if document doesn't exist
    }, { merge: true }); // merge: true will update existing fields or create new document

    // Create username document for uniqueness
    const usernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedUsername);
    await setDoc(usernameRef, {
      userId,
      username,
      createdAt: new Date(),
    });

    // Update all existing CDs owned by this user to include username
    const cdsRef = collection(db, COLLECTIONS.CDS);
    const q = query(cdsRef, where('userId', '==', userId));
    const cdsSnapshot = await getDocs(q);

    const updatePromises = cdsSnapshot.docs.map(cdDoc => 
      updateDoc(doc(db, COLLECTIONS.CDS, cdDoc.id), {
        username,
      })
    );

    await Promise.all(updatePromises);
  } catch (error: any) {
    console.error('Error setting username during migration:', error);
    throw new Error(`Failed to set username: ${error.message}`);
  }
}
