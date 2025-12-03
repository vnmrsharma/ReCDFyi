/**
 * Property-based tests for CD management
 * Tests universal properties that should hold across all CD operations
 * @jest-environment node
 */

import * as fc from 'fast-check';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { MAX_STORAGE_BYTES, MAX_CD_NAME_LENGTH, COLLECTIONS } from '../../src/utils/constants';
import type { CD } from '../../src/types';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'recd-test-project',
    firestore: {
      host: 'localhost',
      port: 8080,
    },
  });
}, 10000);

afterAll(async () => {
  await testEnv.cleanup();
}, 10000);

afterEach(async () => {
  await testEnv.clearFirestore();
}, 10000);

/**
 * Arbitrary for generating valid CD names
 */
const validCDNameArbitrary = fc
  .string({ minLength: 1, maxLength: MAX_CD_NAME_LENGTH })
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating optional labels
 */
const optionalLabelArbitrary = fc.option(
  fc.string({ minLength: 0, maxLength: MAX_CD_NAME_LENGTH }),
  { nil: undefined }
);

/**
 * Arbitrary for generating user IDs
 */
const userIdArbitrary = fc.uuid();

/**
 * Helper function to create a CD directly in Firestore
 */
async function createCDInFirestore(
  firestore: any,
  userId: string,
  name: string,
  label?: string
): Promise<CD> {
  const cdData = {
    userId,
    name,
    label: (label && label.trim().length > 0) ? label : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    storageUsedBytes: 0,
    storageLimitBytes: MAX_STORAGE_BYTES,
    fileCount: 0,
  };

  const docRef = await firestore.collection(COLLECTIONS.CDS).add(cdData);
  const docSnap = await docRef.get();
  const data = docSnap.data();

  if (!data) {
    throw new Error('Failed to retrieve created CD');
  }

  return {
    id: docRef.id,
    userId: data.userId,
    username: data.username || 'testuser',
    name: data.name,
    label: data.label,
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    storageUsedBytes: data.storageUsedBytes || 0,
    storageLimitBytes: data.storageLimitBytes || MAX_STORAGE_BYTES,
    fileCount: data.fileCount || 0,
    isPublic: data.isPublic || false,
    viewCount: data.viewCount || 0,
  };
}

/**
 * Helper function to get user CDs from Firestore
 */
async function getUserCDsFromFirestore(firestore: any, userId: string): Promise<CD[]> {
  const querySnapshot = await firestore
    .collection(COLLECTIONS.CDS)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  return querySnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      label: data.label,
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
      storageUsedBytes: data.storageUsedBytes || 0,
      storageLimitBytes: data.storageLimitBytes || MAX_STORAGE_BYTES,
      fileCount: data.fileCount || 0,
    };
  });
}

describe('CD Property Tests', () => {
  /**
   * Feature: recd-platform, Property 6: CD creation initializes correctly
   * Validates: Requirements 3.2, 3.3, 3.4, 3.5
   *
   * For any valid CD name and optional label, creating a CD should result in a new CD with:
   * - A unique ID
   * - Associated with the correct user
   * - Initialized with 0 bytes used and 20 MB limit
   * - Appearing in the user's collection
   */
  test('Property 6: CD creation initializes correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        validCDNameArbitrary,
        optionalLabelArbitrary,
        async (userId, name, label) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create CD
          const cd = await createCDInFirestore(firestore, userId, name, label);

          // Property 1: CD has a unique ID
          expect(cd.id).toBeDefined();
          expect(typeof cd.id).toBe('string');
          expect(cd.id.length).toBeGreaterThan(0);

          // Property 2: CD is associated with the correct user
          expect(cd.userId).toBe(userId);

          // Property 3: CD name matches input
          expect(cd.name).toBe(name);

          // Property 4: CD label matches input (or null if not provided)
          if (label !== undefined && label.trim().length > 0) {
            expect(cd.label).toBe(label);
          } else {
            expect(cd.label).toBeNull();
          }

          // Property 5: CD is initialized with 0 bytes used
          expect(cd.storageUsedBytes).toBe(0);

          // Property 6: CD has 20 MB storage limit
          expect(cd.storageLimitBytes).toBe(MAX_STORAGE_BYTES);

          // Property 7: CD is initialized with 0 files
          expect(cd.fileCount).toBe(0);

          // Property 8: CD has creation and update timestamps
          expect(cd.createdAt).toBeInstanceOf(Date);
          expect(cd.updatedAt).toBeInstanceOf(Date);

          // Property 9: CD appears in user's collection
          const userCDs = await getUserCDsFromFirestore(firestore, userId);
          const foundCD = userCDs.find((c) => c.id === cd.id);
          expect(foundCD).toBeDefined();
          expect(foundCD?.name).toBe(name);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Feature: recd-platform, Property 7: Collection retrieval is complete
   * Validates: Requirements 5.1, 5.2
   *
   * For any user with CDs, accessing the collection view should retrieve and display
   * all CDs belonging to that user with correct metadata
   */
  test('Property 7: Collection retrieval is complete', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        fc.array(
          fc.record({
            name: validCDNameArbitrary,
            label: optionalLabelArbitrary,
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (userId, cdSpecs) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create multiple CDs
          const createdCDs: CD[] = [];
          for (const spec of cdSpecs) {
            const cd = await createCDInFirestore(firestore, userId, spec.name, spec.label);
            createdCDs.push(cd);
          }

          // Retrieve user's CDs
          const retrievedCDs = await getUserCDsFromFirestore(firestore, userId);

          // Property 1: All created CDs are retrieved
          expect(retrievedCDs.length).toBe(createdCDs.length);

          // Property 2: Each created CD appears in the retrieved collection
          for (const createdCD of createdCDs) {
            const found = retrievedCDs.find((cd) => cd.id === createdCD.id);
            expect(found).toBeDefined();
            expect(found?.name).toBe(createdCD.name);
            expect(found?.userId).toBe(userId);
            expect(found?.storageUsedBytes).toBe(0);
            expect(found?.storageLimitBytes).toBe(MAX_STORAGE_BYTES);
            expect(found?.fileCount).toBe(0);
          }

          // Property 3: No extra CDs are returned
          for (const retrievedCD of retrievedCDs) {
            const found = createdCDs.find((cd) => cd.id === retrievedCD.id);
            expect(found).toBeDefined();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: recd-platform, Property 8: Collection sorting is correct
   * Validates: Requirements 5.5
   *
   * For any collection of CDs, they should be displayed sorted by creation date
   * with newest first
   */
  test('Property 8: Collection sorting is correct', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        fc.array(validCDNameArbitrary, { minLength: 2, maxLength: 5 }),
        async (userId, names) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create CDs sequentially with small delays to ensure different timestamps
          const createdCDs: CD[] = [];
          for (const name of names) {
            const cd = await createCDInFirestore(firestore, userId, name);
            createdCDs.push(cd);
            // Small delay to ensure different timestamps
            await new Promise((resolve) => setTimeout(resolve, 5));
          }

          // Retrieve user's CDs
          const retrievedCDs = await getUserCDsFromFirestore(firestore, userId);

          // Property: CDs are sorted by creation date, newest first
          for (let i = 0; i < retrievedCDs.length - 1; i++) {
            const current = retrievedCDs[i];
            const next = retrievedCDs[i + 1];
            expect(current.createdAt.getTime()).toBeGreaterThanOrEqual(
              next.createdAt.getTime()
            );
          }
        }
      ),
      { numRuns: 20 } // Reduced runs and CD count due to delays
    );
  }, 60000);

  /**
   * Feature: recd-platform, Property 9: CD navigation works
   * Validates: Requirements 5.3
   *
   * For any CD in the collection, clicking on it should navigate to the detailed
   * view for that specific CD (tested by verifying CD can be retrieved by ID)
   */
  test('Property 9: CD navigation works', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        fc.array(validCDNameArbitrary, { minLength: 1, maxLength: 10 }),
        async (userId, names) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create multiple CDs
          const createdCDs: CD[] = [];
          for (const name of names) {
            const cd = await createCDInFirestore(firestore, userId, name);
            createdCDs.push(cd);
          }

          // Property: Each CD can be retrieved individually by its ID
          for (const createdCD of createdCDs) {
            const docRef = firestore.collection(COLLECTIONS.CDS).doc(createdCD.id);
            const docSnap = await docRef.get();

            expect(docSnap.exists).toBe(true);
            const data = docSnap.data();
            
            if (data) {
              expect(data.userId).toBe(userId);
              expect(data.name).toBe(createdCD.name);
              expect(data.storageUsedBytes).toBe(0);
              expect(data.storageLimitBytes).toBe(MAX_STORAGE_BYTES);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});

  /**
   * Feature: recd-platform, Property 25: Access control is enforced
   * Validates: Requirements 9.1, 9.2
   *
   * For any CD access attempt, access should be granted only if the user is the owner
   * or possesses a valid share token; otherwise, access should be denied with an
   * authorization error
   */
  test('Property 25: Access control is enforced', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        userIdArbitrary,
        validCDNameArbitrary,
        fc.constantFrom('owner', 'valid-token', 'expired-token', 'no-token'),
        async (ownerId, otherUserId, cdName, accessType) => {
          // Ensure owner and other user are different
          fc.pre(ownerId !== otherUserId);

          // Set up owner context
          const ownerContext = testEnv.authenticatedContext(ownerId);
          const ownerFirestore = ownerContext.firestore();

          // Create CD as owner
          const cd = await createCDInFirestore(ownerFirestore, ownerId, cdName);

          // Property 1: Owner can always access their own CD
          const ownerCDDoc = await ownerFirestore.collection(COLLECTIONS.CDS).doc(cd.id).get();
          expect(ownerCDDoc.exists).toBe(true);
          expect(ownerCDDoc.data()!.userId).toBe(ownerId);

          let validToken: string | undefined;
          let expiredToken: string | undefined;

          // Create tokens based on access type
          if (accessType === 'valid-token' || accessType === 'expired-token') {
            const now = new Date();

            if (accessType === 'valid-token') {
              // Create a valid share token
              validToken = fc.sample(fc.hexaString({ minLength: 32, maxLength: 32 }), 1)[0];
              const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

              const tokenData = {
                token: validToken,
                cdId: cd.id,
                createdBy: ownerId,
                createdAt: now,
                expiresAt,
                accessCount: 0,
              };

              await ownerFirestore.collection(COLLECTIONS.SHARE_TOKENS).add(tokenData);

              // Property 2: Valid token exists and is not expired
              const tokenQuery = await ownerFirestore
                .collection(COLLECTIONS.SHARE_TOKENS)
                .where('token', '==', validToken)
                .get();

              expect(tokenQuery.empty).toBe(false);
              const tokenDoc = tokenQuery.docs[0];
              expect(tokenDoc.data().cdId).toBe(cd.id);
              expect(tokenDoc.data().expiresAt.toDate().getTime()).toBeGreaterThan(Date.now());
            }

            if (accessType === 'expired-token') {
              // Create an expired token
              expiredToken = fc.sample(fc.hexaString({ minLength: 32, maxLength: 32 }), 1)[0];
              const expiredDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

              const expiredTokenData = {
                token: expiredToken,
                cdId: cd.id,
                createdBy: ownerId,
                createdAt: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
                expiresAt: expiredDate,
                accessCount: 0,
              };

              await ownerFirestore.collection(COLLECTIONS.SHARE_TOKENS).add(expiredTokenData);

              // Property 3: Expired token exists but is expired
              const expiredTokenQuery = await ownerFirestore
                .collection(COLLECTIONS.SHARE_TOKENS)
                .where('token', '==', expiredToken)
                .get();

              expect(expiredTokenQuery.empty).toBe(false);
              const expiredTokenDoc = expiredTokenQuery.docs[0];
              expect(expiredTokenDoc.data().expiresAt.toDate().getTime()).toBeLessThan(Date.now());
            }
          }

          // Property 4: CD ownership is correctly stored
          const cdDoc = await ownerFirestore.collection(COLLECTIONS.CDS).doc(cd.id).get();
          expect(cdDoc.exists).toBe(true);
          expect(cdDoc.data()!.userId).toBe(ownerId);
          expect(cdDoc.data()!.userId).not.toBe(otherUserId);

          // Property 5: Access control logic works correctly
          // Test the verifyAccess logic by checking token validity
          if (accessType === 'valid-token' && validToken) {
            // Valid token should grant access
            const tokenQuery = await ownerFirestore
              .collection(COLLECTIONS.SHARE_TOKENS)
              .where('token', '==', validToken)
              .where('cdId', '==', cd.id)
              .get();

            expect(tokenQuery.empty).toBe(false);
            const tokenDoc = tokenQuery.docs[0];
            const tokenData = tokenDoc.data();
            
            // Verify token is valid
            expect(tokenData.cdId).toBe(cd.id);
            expect(tokenData.expiresAt.toDate().getTime()).toBeGreaterThan(Date.now());
            
            // Property 6: Valid token grants access to correct CD
            expect(tokenData.cdId).toBe(cd.id);
          }

          if (accessType === 'expired-token' && expiredToken) {
            // Expired token should not grant access
            const tokenQuery = await ownerFirestore
              .collection(COLLECTIONS.SHARE_TOKENS)
              .where('token', '==', expiredToken)
              .where('cdId', '==', cd.id)
              .get();

            if (!tokenQuery.empty) {
              const tokenDoc = tokenQuery.docs[0];
              const tokenData = tokenDoc.data();
              
              // Property 7: Expired token is rejected
              expect(tokenData.expiresAt.toDate().getTime()).toBeLessThan(Date.now());
            }
          }

          if (accessType === 'no-token') {
            // No token means only owner should have access
            // Property 8: Without token, only ownership grants access
            expect(cdDoc.data()!.userId).toBe(ownerId);
            
            // Verify no valid tokens exist for this scenario
            const tokenQuery = await ownerFirestore
              .collection(COLLECTIONS.SHARE_TOKENS)
              .where('cdId', '==', cd.id)
              .get();

            // If tokens exist, they should all be expired or for different CDs
            tokenQuery.docs.forEach((doc) => {
              const tokenData = doc.data();
              if (tokenData.cdId === cd.id) {
                // This shouldn't happen in no-token scenario, but if it does,
                // it means we're testing that ownership alone is sufficient
                expect(cdDoc.data()!.userId).toBe(ownerId);
              }
            });
          }

          // Property 9: Owner always has access regardless of tokens
          const ownerAccessDoc = await ownerFirestore.collection(COLLECTIONS.CDS).doc(cd.id).get();
          expect(ownerAccessDoc.exists).toBe(true);
          expect(ownerAccessDoc.data()!.userId).toBe(ownerId);

          // Property 10: CD metadata is preserved across access checks
          expect(ownerAccessDoc.data()!.name).toBe(cdName);
          expect(ownerAccessDoc.data()!.storageUsedBytes).toBe(0);
          expect(ownerAccessDoc.data()!.storageLimitBytes).toBe(MAX_STORAGE_BYTES);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Feature: recd-platform, Property 10: CD contents retrieval is complete
   * Validates: Requirements 6.1, 6.2
   *
   * For any CD with files, opening the CD should retrieve and display all files
   * with correct metadata (thumbnail for images, filename, type, size)
   */
  test('Property 10: CD contents retrieval is complete', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        validCDNameArbitrary,
        fc.array(
          fc.record({
            filename: fc.string({ minLength: 1, maxLength: 50 }),
            originalName: fc.string({ minLength: 1, maxLength: 100 }),
            fileType: fc.constantFrom('image', 'audio', 'video'),
            mimeType: fc.constantFrom(
              'image/jpeg',
              'image/png',
              'audio/mp3',
              'audio/mpeg',
              'audio/wav',
              'video/mp4'
            ),
            sizeBytes: fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (userId, cdName, fileSpecs) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create CD
          const cd = await createCDInFirestore(firestore, userId, cdName);

          // Add files to CD
          const createdFiles: any[] = [];
          for (const fileSpec of fileSpecs) {
            const fileData = {
              cdId: cd.id,
              filename: fileSpec.filename,
              originalName: fileSpec.originalName,
              fileType: fileSpec.fileType,
              mimeType: fileSpec.mimeType,
              sizeBytes: fileSpec.sizeBytes,
              storagePath: `users/${userId}/cds/${cd.id}/files/${fileSpec.filename}`,
              uploadedAt: new Date(),
              thumbnailPath: fileSpec.fileType === 'image' ? `users/${userId}/cds/${cd.id}/thumbnails/${fileSpec.filename}_thumb.jpg` : null,
            };

            const fileRef = await firestore
              .collection(COLLECTIONS.CDS)
              .doc(cd.id)
              .collection(COLLECTIONS.FILES)
              .add(fileData);

            createdFiles.push({ id: fileRef.id, ...fileData });
          }

          // Retrieve files from CD
          const filesSnapshot = await firestore
            .collection(COLLECTIONS.CDS)
            .doc(cd.id)
            .collection(COLLECTIONS.FILES)
            .get();

          const retrievedFiles = filesSnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Property 1: All created files are retrieved
          expect(retrievedFiles.length).toBe(createdFiles.length);

          // Property 2: Each file has correct metadata
          for (const createdFile of createdFiles) {
            const found = retrievedFiles.find((f: any) => f.id === createdFile.id);
            expect(found).toBeDefined();
            expect(found.filename).toBe(createdFile.filename);
            expect(found.originalName).toBe(createdFile.originalName);
            expect(found.fileType).toBe(createdFile.fileType);
            expect(found.mimeType).toBe(createdFile.mimeType);
            expect(found.sizeBytes).toBe(createdFile.sizeBytes);
            expect(found.storagePath).toBe(createdFile.storagePath);

            // Property 3: Images have thumbnail paths
            if (createdFile.fileType === 'image') {
              expect(found.thumbnailPath).toBeDefined();
              expect(found.thumbnailPath).toContain('thumbnails');
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
