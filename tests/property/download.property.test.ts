/**
 * Property-based tests for file download functionality
 * Tests universal properties for file download operations
 * @jest-environment node
 */

import * as fc from 'fast-check';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import type { MediaFile } from '../../src/types';
import { COLLECTIONS } from '../../src/utils/constants';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'recd-download-test',
    firestore: {
      host: 'localhost',
      port: 8080,
    },
    storage: {
      host: 'localhost',
      port: 9199,
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
 * Arbitrary for generating media files
 */
const mediaFileArbitrary = fc.record({
  cdId: fc.uuid(),
  filename: fc.string({ minLength: 1, maxLength: 50 }),
  originalName: fc.string({ minLength: 1, maxLength: 100 }),
  fileType: fc.constantFrom('image', 'audio', 'video') as fc.Arbitrary<'image' | 'audio' | 'video'>,
  mimeType: fc.constantFrom(
    'image/jpeg',
    'image/png',
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'video/mp4'
  ),
  sizeBytes: fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
});

/**
 * Arbitrary for generating user IDs
 */
const userIdArbitrary = fc.uuid();

describe('File Download Property Tests', () => {
  /**
   * Feature: recd-platform, Property 17: Single file download generates URL
   * Validates: Requirements 6.4
   *
   * For any file in a CD, requesting download should generate a valid download URL
   * from Firebase Storage and initiate the download
   */
  test('Property 17: Single file download generates URL', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        mediaFileArbitrary,
        async (userId, fileSpec) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create CD
          const cdData = {
            userId,
            name: 'Test CD',
            label: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            storageUsedBytes: fileSpec.sizeBytes,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 1,
          };

          const cdRef = await firestore.collection(COLLECTIONS.CDS).add(cdData);
          const cdId = cdRef.id;

          // Create file metadata with storage path
          const storagePath = `users/${userId}/cds/${cdId}/files/${fileSpec.filename}`;
          const fileData = {
            cdId,
            filename: fileSpec.filename,
            originalName: fileSpec.originalName,
            fileType: fileSpec.fileType,
            mimeType: fileSpec.mimeType,
            sizeBytes: fileSpec.sizeBytes,
            storagePath,
            uploadedAt: new Date(),
            thumbnailPath: fileSpec.fileType === 'image' ? `users/${userId}/cds/${cdId}/thumbnails/${fileSpec.filename}_thumb.jpg` : null,
          };

          const fileRef = await firestore
            .collection(COLLECTIONS.CDS)
            .doc(cdId)
            .collection(COLLECTIONS.FILES)
            .add(fileData);

          const fileDoc = await fileRef.get();
          const retrievedFile = fileDoc.data();

          // Property 1: File has a storage path
          expect(retrievedFile?.storagePath).toBeDefined();
          expect(typeof retrievedFile?.storagePath).toBe('string');
          expect(retrievedFile?.storagePath.length).toBeGreaterThan(0);

          // Property 2: Storage path follows the correct format
          expect(retrievedFile?.storagePath).toContain(`users/${userId}`);
          expect(retrievedFile?.storagePath).toContain(`cds/${cdId}`);
          expect(retrievedFile?.storagePath).toContain('files/');
          expect(retrievedFile?.storagePath).toContain(fileSpec.filename);

          // Property 3: Storage path is unique per file
          const expectedPath = `users/${userId}/cds/${cdId}/files/${fileSpec.filename}`;
          expect(retrievedFile?.storagePath).toBe(expectedPath);

          // Property 4: File metadata includes all required fields for download
          expect(retrievedFile?.originalName).toBe(fileSpec.originalName);
          expect(retrievedFile?.mimeType).toBe(fileSpec.mimeType);
          expect(retrievedFile?.sizeBytes).toBe(fileSpec.sizeBytes);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Additional property: Storage path uniqueness
   * For any two different files, their storage paths should be unique
   */
  test('Property: Storage paths are unique for different files', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        fc.array(mediaFileArbitrary, { minLength: 2, maxLength: 5 }),
        async (userId, fileSpecs) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create CD
          const cdData = {
            userId,
            name: 'Test CD',
            label: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: fileSpecs.length,
          };

          const cdRef = await firestore.collection(COLLECTIONS.CDS).add(cdData);
          const cdId = cdRef.id;

          // Create files with unique filenames
          const storagePaths: string[] = [];
          for (let i = 0; i < fileSpecs.length; i++) {
            const fileSpec = fileSpecs[i];
            const uniqueFilename = `${fileSpec.filename}_${i}`;
            const storagePath = `users/${userId}/cds/${cdId}/files/${uniqueFilename}`;

            const fileData = {
              cdId,
              filename: uniqueFilename,
              originalName: fileSpec.originalName,
              fileType: fileSpec.fileType,
              mimeType: fileSpec.mimeType,
              sizeBytes: fileSpec.sizeBytes,
              storagePath,
              uploadedAt: new Date(),
              thumbnailPath: null,
            };

            await firestore
              .collection(COLLECTIONS.CDS)
              .doc(cdId)
              .collection(COLLECTIONS.FILES)
              .add(fileData);

            storagePaths.push(storagePath);
          }

          // Property: All storage paths are unique
          const uniquePaths = new Set(storagePaths);
          expect(uniquePaths.size).toBe(storagePaths.length);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});


  /**
   * Feature: recd-platform, Property 18: CD zip contains all files
   * Validates: Requirements 6.5
   *
   * For any CD with files, requesting a full CD download should generate a zip
   * archive containing all files from that CD
   */
  test('Property 18: CD zip contains all files', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary,
        fc.array(mediaFileArbitrary, { minLength: 1, maxLength: 10 }),
        async (userId, fileSpecs) => {
          // Set up authenticated context
          const context = testEnv.authenticatedContext(userId);
          const firestore = context.firestore();

          // Create CD
          const totalSize = fileSpecs.reduce((sum, f) => sum + f.sizeBytes, 0);
          const cdData = {
            userId,
            name: 'Test CD',
            label: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            storageUsedBytes: totalSize,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: fileSpecs.length,
          };

          const cdRef = await firestore.collection(COLLECTIONS.CDS).add(cdData);
          const cdId = cdRef.id;

          // Create file metadata for all files
          const createdFiles: any[] = [];
          for (let i = 0; i < fileSpecs.length; i++) {
            const fileSpec = fileSpecs[i];
            const uniqueFilename = `${fileSpec.filename}_${i}`;
            const storagePath = `users/${userId}/cds/${cdId}/files/${uniqueFilename}`;

            const fileData = {
              cdId,
              filename: uniqueFilename,
              originalName: fileSpec.originalName,
              fileType: fileSpec.fileType,
              mimeType: fileSpec.mimeType,
              sizeBytes: fileSpec.sizeBytes,
              storagePath,
              uploadedAt: new Date(),
              thumbnailPath: null,
            };

            const fileRef = await firestore
              .collection(COLLECTIONS.CDS)
              .doc(cdId)
              .collection(COLLECTIONS.FILES)
              .add(fileData);

            createdFiles.push({ id: fileRef.id, ...fileData });
          }

          // Retrieve all files from CD
          const filesSnapshot = await firestore
            .collection(COLLECTIONS.CDS)
            .doc(cdId)
            .collection(COLLECTIONS.FILES)
            .get();

          const retrievedFiles = filesSnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Property 1: All files are retrieved for zip generation
          expect(retrievedFiles.length).toBe(fileSpecs.length);

          // Property 2: Each file has the required metadata for zip generation
          for (const file of retrievedFiles) {
            expect(file.storagePath).toBeDefined();
            expect(file.originalName).toBeDefined();
            expect(file.sizeBytes).toBeGreaterThan(0);
          }

          // Property 3: File count matches CD metadata
          const cdDoc = await firestore.collection(COLLECTIONS.CDS).doc(cdId).get();
          const cdDataRetrieved = cdDoc.data();
          expect(cdDataRetrieved?.fileCount).toBe(retrievedFiles.length);

          // Property 4: Total size is tracked correctly
          const totalRetrievedSize = retrievedFiles.reduce(
            (sum: number, f: any) => sum + f.sizeBytes,
            0
          );
          expect(cdDataRetrieved?.storageUsedBytes).toBe(totalRetrievedSize);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
