/**
 * User service for managing user profiles and data
 * Public profile lookups use usernames/ (no email). Full user docs are owner-only.
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

export interface PublicUsernameRecord {
  uid: string;
  username: string;
  joinDate: Date;
}

/**
 * Looks up a public username record (no email)
 */
export async function getPublicUserByUsername(
  username: string
): Promise<PublicUsernameRecord | null> {
  try {
    const usernameL = username.toLowerCase();
    const usernameRef = doc(db, COLLECTIONS.USERNAMES, usernameL);
    const usernameSnap = await getDoc(usernameRef);

    if (!usernameSnap.exists()) {
      return null;
    }

    const data = usernameSnap.data();
    return {
      uid: data.userId,
      username: data.username || username,
      joinDate: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    };
  } catch (error: any) {
    console.error('Error fetching public user by username:', error);
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
}

/**
 * @deprecated Prefer getPublicUserByUsername — does not expose email
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const publicUser = await getPublicUserByUsername(username);
  if (!publicUser) {
    return null;
  }

  return {
    uid: publicUser.uid,
    email: '',
    username: publicUser.username,
    publicCDCount: 0,
  };
}

/**
 * Retrieves a user's profile including their public CDs
 */
export async function getUserProfile(
  username: string,
  currentUserId?: string
): Promise<UserProfile> {
  try {
    const publicUser = await getPublicUserByUsername(username);

    if (!publicUser) {
      throw new Error('User not found');
    }

    const isOwnProfile = currentUserId === publicUser.uid;
    let cds: PublicCD[];

    if (isOwnProfile) {
      const allCDs = await getUserCDs(publicUser.uid);
      cds = allCDs.map((cd) => ({
        id: cd.id,
        userId: cd.userId,
        username: cd.username,
        name: cd.name,
        label: cd.label,
        fileCount: cd.fileCount,
        createdAt: cd.createdAt,
        publicAt: cd.publicAt || cd.createdAt,
        viewCount: cd.viewCount,
        thumbnailUrl: undefined,
      }));
    } else {
      cds = await getCreatorPublicCDs(username);
    }

    return {
      username: publicUser.username,
      joinDate: publicUser.joinDate,
      publicCDCount: cds.filter((cd) => cd.publicAt).length,
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
 */
export async function updateUsername(
  userId: string,
  oldUsername: string,
  newUsername: string
): Promise<void> {
  try {
    const normalizedOld = oldUsername.toLowerCase();
    const normalizedNew = newUsername.toLowerCase();

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      username: newUsername,
      usernameL: normalizedNew,
    });

    const oldUsernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedOld);
    const newUsernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedNew);

    await deleteDoc(oldUsernameRef);
    await setDoc(newUsernameRef, {
      userId,
      username: newUsername,
      createdAt: new Date(),
    });

    const cdsRef = collection(db, COLLECTIONS.CDS);
    const q = query(cdsRef, where('userId', '==', userId));
    const cdsSnapshot = await getDocs(q);

    const updatePromises = cdsSnapshot.docs.map((cdDoc) =>
      updateDoc(doc(db, COLLECTIONS.CDS, cdDoc.id), {
        username: newUsername,
      })
    );

    await Promise.all(updatePromises);

    const publicCDsRef = collection(db, COLLECTIONS.PUBLIC_CDS);
    const publicQuery = query(publicCDsRef, where('userId', '==', userId));
    const publicSnapshot = await getDocs(publicQuery);

    const publicUpdatePromises = publicSnapshot.docs.map((publicDoc) =>
      updateDoc(doc(db, COLLECTIONS.PUBLIC_CDS, publicDoc.id), {
        username: newUsername,
      })
    );

    await Promise.all(publicUpdatePromises);

    // Viewer username updates require reading cdViews; owner may not have list access
    // to every CD's analytics. Best-effort only.
    try {
      const cdViewsRef = collection(db, COLLECTIONS.CD_VIEWS);
      const viewsSnapshot = await getDocs(cdViewsRef);
      const viewUpdatePromises: Promise<void>[] = [];

      for (const cdViewDoc of viewsSnapshot.docs) {
        const viewersRef = collection(db, COLLECTIONS.CD_VIEWS, cdViewDoc.id, 'viewers');
        const viewersQuery = query(viewersRef, where('viewerUserId', '==', userId));
        const viewersSnapshot = await getDocs(viewersQuery);

        viewersSnapshot.docs.forEach((viewerDoc) => {
          viewUpdatePromises.push(
            updateDoc(doc(db, COLLECTIONS.CD_VIEWS, cdViewDoc.id, 'viewers', viewerDoc.id), {
              viewerUsername: newUsername,
            })
          );
        });
      }

      await Promise.all(viewUpdatePromises);
    } catch (error) {
      console.warn('Could not update viewer usernames across all CDs:', error);
    }
  } catch (error: any) {
    console.error('Error updating username:', error);
    throw new Error(`Failed to update username: ${error.message}`);
  }
}

/**
 * Sets username for an existing user during migration
 */
export async function setUsernameDuringMigration(
  userId: string,
  username: string
): Promise<void> {
  try {
    const normalizedUsername = username.toLowerCase();

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(
      userRef,
      {
        username,
        usernameL: normalizedUsername,
        publicCDCount: 0,
        createdAt: new Date(),
      },
      { merge: true }
    );

    const usernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedUsername);
    await setDoc(usernameRef, {
      userId,
      username,
      createdAt: new Date(),
    });

    const cdsRef = collection(db, COLLECTIONS.CDS);
    const q = query(cdsRef, where('userId', '==', userId));
    const cdsSnapshot = await getDocs(q);

    const updatePromises = cdsSnapshot.docs.map((cdDoc) =>
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
