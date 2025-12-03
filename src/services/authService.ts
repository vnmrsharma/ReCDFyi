/**
 * Authentication service for user management
 * Handles signup, login, logout, and password reset operations
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { normalizeUsername } from './validationService';
import type { User } from '../types';

/**
 * Maps Firebase User to application User type
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
  };
}

/**
 * Creates a new user account with email, password, and username
 * @param email - User's email address
 * @param password - User's password (minimum 6 characters)
 * @param username - User's unique username (3-20 characters)
 * @returns Promise resolving to the created User
 * @throws {Error} If signup fails (e.g., email already in use, weak password, username taken)
 */
export async function signUp(email: string, password: string, username: string): Promise<User> {
  try {
    // Create Firebase Auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    const userId = userCredential.user.uid;
    const usernameL = normalizeUsername(username);

    // Create user document in users collection
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userDocRef, {
      email,
      username,
      usernameL,
      publicCDCount: 0,
      createdAt: serverTimestamp(),
    });

    // Create username document in usernames collection for uniqueness
    const usernameDocRef = doc(db, COLLECTIONS.USERNAMES, usernameL);
    await setDoc(usernameDocRef, {
      userId,
      username, // Store original case
      createdAt: serverTimestamp(),
    });

    return {
      uid: userId,
      email,
      username,
      publicCDCount: 0,
    };
  } catch (error: any) {
    // If Firestore operations fail, we should ideally delete the auth user
    // For now, we'll just throw the error
    throw new Error(mapAuthError(error.code));
  }
}

/**
 * Authenticates a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated User
 * @throws {Error} If login fails (e.g., invalid credentials)
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    throw new Error(mapAuthError(error.code));
  }
}

/**
 * Signs out the current user
 * @returns Promise that resolves when logout is complete
 * @throws {Error} If logout fails
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error('Failed to log out. Please try again.');
  }
}

/**
 * Sends a password reset email to the specified address
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 * @throws {Error} If password reset fails
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(mapAuthError(error.code));
  }
}

/**
 * Gets the currently authenticated user
 * @returns Current User or null if not authenticated
 */
export function getCurrentUser(): User | null {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
}

/**
 * Subscribes to authentication state changes
 * @param callback - Function called when auth state changes
 * @returns Unsubscribe function to stop listening
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
}

/**
 * Maps Firebase auth error codes to user-friendly messages
 * @param errorCode - Firebase error code
 * @returns User-friendly error message
 */
function mapAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    default:
      return 'An error occurred. Please try again';
  }
}
