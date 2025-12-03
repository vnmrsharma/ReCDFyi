/**
 * Property-based tests for Authentication Service
 * Using fast-check for property-based testing with minimum 100 iterations
 */

import * as fc from 'fast-check';
import { signUp, login, resetPassword } from '../../src/services/authService';
import { auth } from '../../src/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock('../../src/config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

const mockCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<
  typeof createUserWithEmailAndPassword
>;
const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<
  typeof signInWithEmailAndPassword
>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockSendPasswordReset = sendPasswordResetEmail as jest.MockedFunction<
  typeof sendPasswordResetEmail
>;

// Helper to create a mock Firebase user
function createMockFirebaseUser(email: string, uid: string): FirebaseUser {
  return {
    uid,
    email,
    displayName: null,
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
  } as any;
}

// Arbitrary for valid email addresses
const validEmailArb = fc.emailAddress();

// Arbitrary for valid passwords (minimum 6 characters)
const validPasswordArb = fc.string({ minLength: 6, maxLength: 50 });

// Arbitrary for invalid passwords (less than 6 characters)
const invalidPasswordArb = fc.string({ minLength: 0, maxLength: 5 });

// Arbitrary for invalid email formats
const invalidEmailArb = fc.oneof(
  fc.constant(''),
  fc.constant('notanemail'),
  fc.constant('@example.com'),
  fc.constant('user@'),
  fc.string().filter((s) => !s.includes('@') && s.length > 0)
);

describe('Authentication Service Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Firestore operations to succeed by default
    mockDoc.mockReturnValue({} as any);
    mockSetDoc.mockResolvedValue(undefined);
  });

  describe('Property 1: Valid signup creates authenticated user', () => {
    /**
     * Feature: recd-platform, Property 1: Valid signup creates authenticated user
     * Validates: Requirements 1.2, 1.4
     *
     * For any valid email and password combination, successfully creating an account
     * should result in an authenticated user with access to the CD collection view.
     */

    it('should create authenticated user for any valid email and password', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          // Mock successful user creation
          const mockUid = `uid_${Math.random().toString(36).substring(7)}`;
          const mockFirebaseUser = createMockFirebaseUser(email, mockUid);

          mockCreateUser.mockResolvedValueOnce({
            user: mockFirebaseUser,
          } as any);

          const username = `user_${Math.random().toString(36).substring(7)}`;
          const user = await signUp(email, password, username);

          // Verify user was created with correct properties
          expect(user).toBeDefined();
          expect(user.uid).toBe(mockUid);
          expect(user.email).toBe(email);
          expect(mockCreateUser).toHaveBeenCalledWith(auth, email, password);
        }),
        { numRuns: 100 }
      );
    });

    it('should return user object with uid and email for valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          const mockUid = `uid_${Math.random().toString(36).substring(7)}`;
          const mockFirebaseUser = createMockFirebaseUser(email, mockUid);

          mockCreateUser.mockResolvedValueOnce({
            user: mockFirebaseUser,
          } as any);

          const username = `user_${Math.random().toString(36).substring(7)}`;
          const user = await signUp(email, password, username);

          // User object should have required properties
          expect(user).toHaveProperty('uid');
          expect(user).toHaveProperty('email');
          expect(typeof user.uid).toBe('string');
          expect(typeof user.email).toBe('string');
          expect(user.uid.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Invalid credentials are rejected', () => {
    /**
     * Feature: recd-platform, Property 2: Invalid credentials are rejected
     * Validates: Requirements 1.3
     *
     * For any invalid email format or weak password, the signup process should
     * reject the credentials and display specific validation errors without creating an account.
     */

    it('should reject signup with invalid email format', async () => {
      await fc.assert(
        fc.asyncProperty(invalidEmailArb, validPasswordArb, async (email, password) => {
          // Mock Firebase error for invalid email
          mockCreateUser.mockRejectedValueOnce({
            code: 'auth/invalid-email',
          });

          const username = `user_${Math.random().toString(36).substring(7)}`;
          await expect(signUp(email, password, username)).rejects.toThrow(
            'Please enter a valid email address'
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should reject signup with weak password', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, invalidPasswordArb, async (email, password) => {
          // Mock Firebase error for weak password
          mockCreateUser.mockRejectedValueOnce({
            code: 'auth/weak-password',
          });

          const username = `user_${Math.random().toString(36).substring(7)}`;
          await expect(signUp(email, password, username)).rejects.toThrow(
            'Password must be at least 6 characters'
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should reject signup with already registered email', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          // Mock Firebase error for email already in use
          mockCreateUser.mockRejectedValueOnce({
            code: 'auth/email-already-in-use',
          });

          const username = `user_${Math.random().toString(36).substring(7)}`;
          await expect(signUp(email, password, username)).rejects.toThrow(
            'This email is already registered'
          );
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Valid login grants access', () => {
    /**
     * Feature: recd-platform, Property 3: Valid login grants access
     * Validates: Requirements 2.2, 2.4
     *
     * For any existing user with valid credentials, logging in should authenticate
     * the user and redirect to their CD collection view.
     */

    it('should authenticate user for any valid email and password', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          // Mock successful login
          const mockUid = `uid_${Math.random().toString(36).substring(7)}`;
          const mockFirebaseUser = createMockFirebaseUser(email, mockUid);

          mockSignIn.mockResolvedValueOnce({
            user: mockFirebaseUser,
          } as any);

          const user = await login(email, password);

          // Verify user was authenticated with correct properties
          expect(user).toBeDefined();
          expect(user.uid).toBe(mockUid);
          expect(user.email).toBe(email);
          expect(mockSignIn).toHaveBeenCalledWith(auth, email, password);
        }),
        { numRuns: 100 }
      );
    });

    it('should return consistent user object structure on login', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          const mockUid = `uid_${Math.random().toString(36).substring(7)}`;
          const mockFirebaseUser = createMockFirebaseUser(email, mockUid);

          mockSignIn.mockResolvedValueOnce({
            user: mockFirebaseUser,
          } as any);

          const user = await login(email, password);

          // User object should match expected structure
          expect(user).toHaveProperty('uid');
          expect(user).toHaveProperty('email');
          expect(typeof user.uid).toBe('string');
          expect(typeof user.email).toBe('string');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Invalid login is rejected', () => {
    /**
     * Feature: recd-platform, Property 4: Invalid login is rejected
     * Validates: Requirements 2.3
     *
     * For any incorrect email or password combination, the login attempt should
     * fail with an authentication error and prevent access.
     */

    it('should reject login with non-existent user', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          // Mock Firebase error for user not found
          mockSignIn.mockRejectedValueOnce({
            code: 'auth/user-not-found',
          });

          await expect(login(email, password)).rejects.toThrow('Invalid email or password');
        }),
        { numRuns: 100 }
      );
    });

    it('should reject login with wrong password', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          // Mock Firebase error for wrong password
          mockSignIn.mockRejectedValueOnce({
            code: 'auth/wrong-password',
          });

          await expect(login(email, password)).rejects.toThrow('Invalid email or password');
        }),
        { numRuns: 100 }
      );
    });

    it('should reject login with invalid email format', async () => {
      await fc.assert(
        fc.asyncProperty(invalidEmailArb, validPasswordArb, async (email, password) => {
          // Mock Firebase error for invalid email
          mockSignIn.mockRejectedValueOnce({
            code: 'auth/invalid-email',
          });

          await expect(login(email, password)).rejects.toThrow(
            'Please enter a valid email address'
          );
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Password reset sends email', () => {
    /**
     * Feature: recd-platform, Property 5: Password reset sends email
     * Validates: Requirements 2.5
     *
     * For any registered user email, requesting a password reset should trigger
     * a reset email via Firebase Auth.
     */

    it('should send password reset email for any valid email', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, async (email) => {
          // Mock successful password reset email send
          mockSendPasswordReset.mockResolvedValueOnce(undefined);

          await resetPassword(email);

          // Verify password reset email was sent
          expect(mockSendPasswordReset).toHaveBeenCalledWith(auth, email);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle password reset for non-existent email gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, async (email) => {
          // Firebase sends email even if user doesn't exist (security best practice)
          mockSendPasswordReset.mockResolvedValueOnce(undefined);

          await expect(resetPassword(email)).resolves.not.toThrow();
          expect(mockSendPasswordReset).toHaveBeenCalledWith(auth, email);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject password reset with invalid email format', async () => {
      await fc.assert(
        fc.asyncProperty(invalidEmailArb, async (email) => {
          // Mock Firebase error for invalid email
          mockSendPasswordReset.mockRejectedValueOnce({
            code: 'auth/invalid-email',
          });

          await expect(resetPassword(email)).rejects.toThrow(
            'Please enter a valid email address'
          );
        }),
        { numRuns: 100 }
      );
    });
  });
});

  describe('Property 30: Auth errors are safe', () => {
    /**
     * Feature: recd-platform, Property 30: Auth errors are safe
     * Validates: Requirements 11.3
     *
     * For any authentication failure, the error message should be clear but not
     * expose sensitive security information (e.g., whether email exists).
     */

    it('should not reveal whether email exists in the system', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          // Test both user-not-found and wrong-password errors
          const errorCodes = ['auth/user-not-found', 'auth/wrong-password'];

          for (const errorCode of errorCodes) {
            mockSignIn.mockRejectedValueOnce({ code: errorCode });

            try {
              await login(email, password);
              fail('Should have thrown an error');
            } catch (error: any) {
              // Both errors should produce the same generic message
              expect(error.message).toBe('Invalid email or password');

              // Error should not reveal specific details
              expect(error.message).not.toContain('not found');
              expect(error.message).not.toContain('does not exist');
              expect(error.message).not.toContain('wrong password');
              expect(error.message).not.toContain('incorrect password');
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should provide user-friendly error messages without technical details', async () => {
      await fc.assert(
        fc.asyncProperty(
          validEmailArb,
          validPasswordArb,
          fc.constantFrom(
            'auth/user-not-found',
            'auth/wrong-password',
            'auth/invalid-email',
            'auth/weak-password',
            'auth/email-already-in-use',
            'auth/too-many-requests',
            'auth/network-request-failed',
            'auth/user-disabled'
          ),
          async (email, password, errorCode) => {
            // Mock the error
            mockSignIn.mockRejectedValueOnce({ code: errorCode });

            try {
              await login(email, password);
              fail('Should have thrown an error');
            } catch (error: any) {
              // Error message should be user-friendly
              expect(error.message).toBeTruthy();
              expect(error.message.length).toBeGreaterThan(0);

              // Should not contain technical jargon
              expect(error.message).not.toContain('auth/');
              expect(error.message).not.toContain('firebase');
              expect(error.message).not.toContain('code:');
              expect(error.message).not.toContain('stack');

              // Should not contain internal error codes
              expect(error.message.toLowerCase()).not.toMatch(/error code/i);
              expect(error.message.toLowerCase()).not.toMatch(/exception/i);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map all Firebase auth errors to safe messages', async () => {
      const errorMappings = [
        { code: 'auth/email-already-in-use', expected: 'This email is already registered' },
        { code: 'auth/invalid-email', expected: 'Please enter a valid email address' },
        { code: 'auth/weak-password', expected: 'Password must be at least 6 characters' },
        { code: 'auth/user-not-found', expected: 'Invalid email or password' },
        { code: 'auth/wrong-password', expected: 'Invalid email or password' },
        { code: 'auth/too-many-requests', expected: 'Too many failed attempts. Please try again later' },
        { code: 'auth/network-request-failed', expected: 'Network error. Please check your connection and try again' },
        { code: 'auth/user-disabled', expected: 'This account has been disabled' },
      ];

      for (const { code, expected } of errorMappings) {
        mockSignIn.mockRejectedValueOnce({ code });

        try {
          await login('test@example.com', 'password123');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.message).toBe(expected);
        }
      }
    });

    it('should provide generic error for unknown auth errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          validEmailArb,
          validPasswordArb,
          fc.string({ minLength: 5, maxLength: 30 }).filter(s => !s.startsWith('auth/')),
          async (email, password, unknownCode) => {
            // Mock an unknown error code
            mockSignIn.mockRejectedValueOnce({ code: unknownCode });

            try {
              await login(email, password);
              fail('Should have thrown an error');
            } catch (error: any) {
              // Should provide a generic, safe error message
              expect(error.message).toBe('An error occurred. Please try again');

              // Should not expose the unknown error code
              expect(error.message).not.toContain(unknownCode);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not expose email addresses in error messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          validEmailArb,
          validPasswordArb,
          fc.constantFrom(
            'auth/user-not-found',
            'auth/wrong-password',
            'auth/email-already-in-use',
            'auth/invalid-email'
          ),
          async (email, password, errorCode) => {
            mockSignIn.mockRejectedValueOnce({ code: errorCode });

            try {
              await login(email, password);
              fail('Should have thrown an error');
            } catch (error: any) {
              // Error message should not contain the email address
              expect(error.message).not.toContain(email);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle rate limiting errors safely', async () => {
      await fc.assert(
        fc.asyncProperty(validEmailArb, validPasswordArb, async (email, password) => {
          mockSignIn.mockRejectedValueOnce({ code: 'auth/too-many-requests' });

          try {
            await login(email, password);
            fail('Should have thrown an error');
          } catch (error: any) {
            // Rate limiting error should be informative but not reveal attack surface
            expect(error.message).toContain('Too many');
            expect(error.message).toContain('try again later');

            // Should not reveal specific rate limit details
            expect(error.message).not.toMatch(/\d+ attempts/i);
            expect(error.message).not.toMatch(/\d+ minutes/i);
            expect(error.message).not.toContain('blocked');
            expect(error.message).not.toContain('banned');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should provide actionable guidance without security risks', async () => {
      await fc.assert(
        fc.asyncProperty(
          validEmailArb,
          validPasswordArb,
          fc.constantFrom(
            'auth/network-request-failed',
            'auth/too-many-requests',
            'auth/weak-password'
          ),
          async (email, password, errorCode) => {
            mockSignIn.mockRejectedValueOnce({ code: errorCode });

            try {
              await login(email, password);
              fail('Should have thrown an error');
            } catch (error: any) {
              // Error should provide guidance
              const hasGuidance =
                error.message.includes('try again') ||
                error.message.includes('check your') ||
                error.message.includes('must be at least');

              expect(hasGuidance).toBe(true);

              // But should not reveal system internals
              expect(error.message).not.toContain('database');
              expect(error.message).not.toContain('server');
              expect(error.message).not.toContain('API');
              expect(error.message).not.toContain('endpoint');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
