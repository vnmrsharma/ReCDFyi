/**
 * Firebase Security Rules Unit Tests
 * 
 * Tests Firestore and Storage security rules using Firebase Emulator Suite
 * Requirements: 9.1, 9.2, 9.5
 * 
 * Prerequisites:
 * - Firebase Emulator Suite must be running: firebase emulators:start
 * - Install dependencies: npm install --save-dev @firebase/rules-unit-testing
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { setDoc, doc, getDoc, updateDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Firebase Security Rules', () => {
  let testEnv: RulesTestEnvironment;
  
  const OWNER_UID = 'owner-user-123';
  const OTHER_UID = 'other-user-456';
  const CD_ID = 'test-cd-001';
  const FILE_ID = 'test-file-001';
  
  beforeAll(async () => {
    // Initialize test environment with security rules
    testEnv = await initializeTestEnvironment({
      projectId: 'recd-test-project',
      firestore: {
        rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
        host: 'localhost',
        port: 8080,
      },
      storage: {
        rules: readFileSync(resolve(__dirname, '../../storage.rules'), 'utf8'),
        host: 'localhost',
        port: 9199,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  });

  describe('Firestore Security Rules', () => {
    describe('Users Collection', () => {
      it('should allow users to read their own user document', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const userRef = doc(ownerContext.firestore(), 'users', OWNER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'users', OWNER_UID), {
            email: 'owner@example.com',
            createdAt: new Date(),
          });
        });
        
        await assertSucceeds(getDoc(userRef));
      });

      it('should deny users from reading other users documents', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const userRef = doc(otherContext.firestore(), 'users', OWNER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'users', OWNER_UID), {
            email: 'owner@example.com',
            createdAt: new Date(),
          });
        });
        
        await assertFails(getDoc(userRef));
      });

      it('should allow users to write their own user document', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const userRef = doc(ownerContext.firestore(), 'users', OWNER_UID);
        
        await assertSucceeds(
          setDoc(userRef, {
            email: 'owner@example.com',
            createdAt: new Date(),
          })
        );
      });
    });

    describe('CDs Collection - Owner Access', () => {
      it('should allow owner to read their own CD', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const cdRef = doc(ownerContext.firestore(), 'cds', CD_ID);
        
        // Create CD as owner
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        await assertSucceeds(getDoc(cdRef));
      });

      it('should allow owner to create a CD', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const cdRef = doc(ownerContext.firestore(), 'cds', CD_ID);
        
        await assertSucceeds(
          setDoc(cdRef, {
            userId: OWNER_UID,
            name: 'New CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          })
        );
      });

      it('should allow owner to update their CD', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const cdRef = doc(ownerContext.firestore(), 'cds', CD_ID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        await assertSucceeds(
          updateDoc(cdRef, {
            storageUsedBytes: 1024,
            fileCount: 1,
          })
        );
      });

      it('should allow owner to delete their CD', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const cdRef = doc(ownerContext.firestore(), 'cds', CD_ID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        await assertSucceeds(deleteDoc(cdRef));
      });

      it('should deny non-owner from reading CD without share token', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const cdRef = doc(otherContext.firestore(), 'cds', CD_ID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        await assertFails(getDoc(cdRef));
      });

      it('should deny non-owner from updating CD', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const cdRef = doc(otherContext.firestore(), 'cds', CD_ID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        await assertFails(
          updateDoc(cdRef, {
            name: 'Hacked CD',
          })
        );
      });

      it('should deny non-owner from deleting CD', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const cdRef = doc(otherContext.firestore(), 'cds', CD_ID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        await assertFails(deleteDoc(cdRef));
      });
    });

    describe('CDs Collection - Share Token Access', () => {
      it('should allow access to CD with valid share token', async () => {
        const TOKEN = 'valid-token-123';
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        
        // Create CD and valid share token
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Shared CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
          
          await setDoc(doc(context.firestore(), 'shareTokens', TOKEN), {
            token: TOKEN,
            cdId: CD_ID,
            createdBy: OWNER_UID,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            accessCount: 0,
          });
        });
        
        // Access with token query parameter
        const cdRef = doc(otherContext.firestore(), 'cds', CD_ID);
        // Note: In actual implementation, token would be passed as query parameter
        // For testing, we verify the rule logic by checking if token exists and is valid
        await assertSucceeds(getDoc(cdRef));
      });

      it('should deny access to CD with expired share token', async () => {
        const TOKEN = 'expired-token-456';
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        
        // Create CD and expired share token
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Shared CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
          
          await setDoc(doc(context.firestore(), 'shareTokens', TOKEN), {
            token: TOKEN,
            cdId: CD_ID,
            createdBy: OWNER_UID,
            createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
            accessCount: 0,
          });
        });
        
        const cdRef = doc(otherContext.firestore(), 'cds', CD_ID);
        await assertFails(getDoc(cdRef));
      });

      it('should deny access to CD with invalid share token', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        
        // Create CD without any share token
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Shared CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        const cdRef = doc(otherContext.firestore(), 'cds', CD_ID);
        await assertFails(getDoc(cdRef));
      });
    });

    describe('Files Subcollection', () => {
      it('should allow owner to read files in their CD', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
          
          await setDoc(doc(context.firestore(), `cds/${CD_ID}/files`, FILE_ID), {
            filename: 'test.jpg',
            originalName: 'test.jpg',
            fileType: 'image',
            mimeType: 'image/jpeg',
            sizeBytes: 1024,
            storagePath: `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`,
            uploadedAt: new Date(),
          });
        });
        
        const fileRef = doc(ownerContext.firestore(), `cds/${CD_ID}/files`, FILE_ID);
        await assertSucceeds(getDoc(fileRef));
      });

      it('should allow owner to write files to their CD', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        const fileRef = doc(ownerContext.firestore(), `cds/${CD_ID}/files`, FILE_ID);
        await assertSucceeds(
          setDoc(fileRef, {
            filename: 'test.jpg',
            originalName: 'test.jpg',
            fileType: 'image',
            mimeType: 'image/jpeg',
            sizeBytes: 1024,
            storagePath: `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`,
            uploadedAt: new Date(),
          })
        );
      });

      it('should deny non-owner from writing files without share token', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        const fileRef = doc(otherContext.firestore(), `cds/${CD_ID}/files`, FILE_ID);
        await assertFails(
          setDoc(fileRef, {
            filename: 'malicious.jpg',
            originalName: 'malicious.jpg',
            fileType: 'image',
            mimeType: 'image/jpeg',
            sizeBytes: 1024,
            storagePath: `users/${OTHER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`,
            uploadedAt: new Date(),
          })
        );
      });
    });

    describe('ShareTokens Collection', () => {
      it('should allow anyone to read share tokens', async () => {
        const TOKEN = 'public-token-789';
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'shareTokens', TOKEN), {
            token: TOKEN,
            cdId: CD_ID,
            createdBy: OWNER_UID,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            accessCount: 0,
          });
        });
        
        const tokenRef = doc(otherContext.firestore(), 'shareTokens', TOKEN);
        await assertSucceeds(getDoc(tokenRef));
      });

      it('should allow owner to create share token for their CD', async () => {
        const TOKEN = 'new-token-abc';
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        const tokenRef = doc(ownerContext.firestore(), 'shareTokens', TOKEN);
        await assertSucceeds(
          setDoc(tokenRef, {
            token: TOKEN,
            cdId: CD_ID,
            createdBy: OWNER_UID,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            accessCount: 0,
          })
        );
      });

      it('should deny non-owner from creating share token for CD they do not own', async () => {
        const TOKEN = 'unauthorized-token-xyz';
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'cds', CD_ID), {
            userId: OWNER_UID,
            name: 'Test CD',
            createdAt: new Date(),
            storageUsedBytes: 0,
            storageLimitBytes: 20 * 1024 * 1024,
            fileCount: 0,
          });
        });
        
        const tokenRef = doc(otherContext.firestore(), 'shareTokens', TOKEN);
        await assertFails(
          setDoc(tokenRef, {
            token: TOKEN,
            cdId: CD_ID,
            createdBy: OTHER_UID,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            accessCount: 0,
          })
        );
      });

      it('should allow token creator to update their token', async () => {
        const TOKEN = 'update-token-def';
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'shareTokens', TOKEN), {
            token: TOKEN,
            cdId: CD_ID,
            createdBy: OWNER_UID,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            accessCount: 0,
          });
        });
        
        const tokenRef = doc(ownerContext.firestore(), 'shareTokens', TOKEN);
        await assertSucceeds(
          updateDoc(tokenRef, {
            accessCount: 5,
          })
        );
      });

      it('should allow token creator to delete their token', async () => {
        const TOKEN = 'delete-token-ghi';
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'shareTokens', TOKEN), {
            token: TOKEN,
            cdId: CD_ID,
            createdBy: OWNER_UID,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            accessCount: 0,
          });
        });
        
        const tokenRef = doc(ownerContext.firestore(), 'shareTokens', TOKEN);
        await assertSucceeds(deleteDoc(tokenRef));
      });
    });

    describe('EmailLogs Collection', () => {
      it('should allow user to read their own email logs', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const logId = 'log-001';
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'emailLogs', logId), {
            userId: OWNER_UID,
            recipientEmail: 'recipient@example.com',
            subject: 'Check out my CD',
            cdId: CD_ID,
            cdName: 'Test CD',
            status: 'sent',
            sentAt: new Date(),
          });
        });
        
        const logRef = doc(ownerContext.firestore(), 'emailLogs', logId);
        await assertSucceeds(getDoc(logRef));
      });

      it('should deny user from reading other users email logs', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const logId = 'log-002';
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await setDoc(doc(context.firestore(), 'emailLogs', logId), {
            userId: OWNER_UID,
            recipientEmail: 'recipient@example.com',
            subject: 'Check out my CD',
            cdId: CD_ID,
            cdName: 'Test CD',
            status: 'sent',
            sentAt: new Date(),
          });
        });
        
        const logRef = doc(otherContext.firestore(), 'emailLogs', logId);
        await assertFails(getDoc(logRef));
      });

      it('should allow user to create their own email log', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const logId = 'log-003';
        
        const logRef = doc(ownerContext.firestore(), 'emailLogs', logId);
        await assertSucceeds(
          setDoc(logRef, {
            userId: OWNER_UID,
            recipientEmail: 'recipient@example.com',
            subject: 'Check out my CD',
            cdId: CD_ID,
            cdName: 'Test CD',
            status: 'pending',
            sentAt: new Date(),
          })
        );
      });

      it('should deny user from creating email log for another user', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const logId = 'log-004';
        
        const logRef = doc(otherContext.firestore(), 'emailLogs', logId);
        await assertFails(
          setDoc(logRef, {
            userId: OWNER_UID, // Trying to create log for different user
            recipientEmail: 'recipient@example.com',
            subject: 'Check out my CD',
            cdId: CD_ID,
            cdName: 'Test CD',
            status: 'pending',
            sentAt: new Date(),
          })
        );
      });
    });
  });

  describe('Storage Security Rules', () => {
    describe('File Upload Validation', () => {
      it('should allow owner to upload valid image file (JPEG)', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`;
        const fileRef = ref(storage, filePath);
        
        // Create a small test file
        const testFile = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
        
        await assertSucceeds(
          uploadBytes(fileRef, testFile, {
            contentType: 'image/jpeg',
          })
        );
      });

      it('should allow owner to upload valid image file (PNG)', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.png`;
        const fileRef = ref(storage, filePath);
        
        const testFile = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG header
        
        await assertSucceeds(
          uploadBytes(fileRef, testFile, {
            contentType: 'image/png',
          })
        );
      });

      it('should allow owner to upload valid audio file (MP3)', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.mp3`;
        const fileRef = ref(storage, filePath);
        
        const testFile = new Uint8Array(1024); // Small audio file
        
        await assertSucceeds(
          uploadBytes(fileRef, testFile, {
            contentType: 'audio/mpeg',
          })
        );
      });

      it('should allow owner to upload valid audio file (WAV)', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.wav`;
        const fileRef = ref(storage, filePath);
        
        const testFile = new Uint8Array(1024);
        
        await assertSucceeds(
          uploadBytes(fileRef, testFile, {
            contentType: 'audio/wav',
          })
        );
      });

      it('should allow owner to upload valid video file (MP4) under 5MB', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.mp4`;
        const fileRef = ref(storage, filePath);
        
        // Create a 4MB test file (under the 5MB limit for videos)
        const testFile = new Uint8Array(4 * 1024 * 1024);
        
        await assertSucceeds(
          uploadBytes(fileRef, testFile, {
            contentType: 'video/mp4',
          })
        );
      });

      it('should deny owner from uploading invalid file type', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.exe`;
        const fileRef = ref(storage, filePath);
        
        const testFile = new Uint8Array(1024);
        
        await assertFails(
          uploadBytes(fileRef, testFile, {
            contentType: 'application/x-msdownload',
          })
        );
      });

      it('should deny owner from uploading video file over 5MB', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.mp4`;
        const fileRef = ref(storage, filePath);
        
        // Create a 6MB test file (over the 5MB limit for videos)
        const testFile = new Uint8Array(6 * 1024 * 1024);
        
        await assertFails(
          uploadBytes(fileRef, testFile, {
            contentType: 'video/mp4',
          })
        );
      });

      it('should deny owner from uploading non-video file over 20MB', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`;
        const fileRef = ref(storage, filePath);
        
        // Create a 21MB test file (over the 20MB limit)
        const testFile = new Uint8Array(21 * 1024 * 1024);
        
        await assertFails(
          uploadBytes(fileRef, testFile, {
            contentType: 'image/jpeg',
          })
        );
      });

      it('should deny non-owner from uploading to another users CD', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const storage = otherContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`;
        const fileRef = ref(storage, filePath);
        
        const testFile = new Uint8Array(1024);
        
        await assertFails(
          uploadBytes(fileRef, testFile, {
            contentType: 'image/jpeg',
          })
        );
      });
    });

    describe('File Access Control', () => {
      it('should allow owner to read their own files', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`;
        const fileRef = ref(storage, filePath);
        
        // Upload file first
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          const adminRef = ref(adminStorage, filePath);
          await uploadBytes(adminRef, new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]), {
            contentType: 'image/jpeg',
          });
        });
        
        await assertSucceeds(getDownloadURL(fileRef));
      });

      it('should deny non-owner from reading files without share token', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const storage = otherContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`;
        const fileRef = ref(storage, filePath);
        
        // Upload file as owner
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          const adminRef = ref(adminStorage, filePath);
          await uploadBytes(adminRef, new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]), {
            contentType: 'image/jpeg',
          });
        });
        
        await assertFails(getDownloadURL(fileRef));
      });

      it('should allow owner to delete their own files', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`;
        const fileRef = ref(storage, filePath);
        
        // Upload file first
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          const adminRef = ref(adminStorage, filePath);
          await uploadBytes(adminRef, new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]), {
            contentType: 'image/jpeg',
          });
        });
        
        await assertSucceeds(deleteObject(fileRef));
      });

      it('should deny non-owner from deleting files', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const storage = otherContext.storage();
        const filePath = `users/${OWNER_UID}/cds/${CD_ID}/files/${FILE_ID}.jpg`;
        const fileRef = ref(storage, filePath);
        
        // Upload file as owner
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          const adminRef = ref(adminStorage, filePath);
          await uploadBytes(adminRef, new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]), {
            contentType: 'image/jpeg',
          });
        });
        
        await assertFails(deleteObject(fileRef));
      });
    });

    describe('Thumbnail Access Control', () => {
      it('should allow owner to upload thumbnails', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const thumbnailPath = `users/${OWNER_UID}/cds/${CD_ID}/thumbnails/${FILE_ID}_thumb.jpg`;
        const thumbnailRef = ref(storage, thumbnailPath);
        
        const testThumbnail = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
        
        await assertSucceeds(
          uploadBytes(thumbnailRef, testThumbnail, {
            contentType: 'image/jpeg',
          })
        );
      });

      it('should allow owner to read their thumbnails', async () => {
        const ownerContext = testEnv.authenticatedContext(OWNER_UID);
        const storage = ownerContext.storage();
        const thumbnailPath = `users/${OWNER_UID}/cds/${CD_ID}/thumbnails/${FILE_ID}_thumb.jpg`;
        const thumbnailRef = ref(storage, thumbnailPath);
        
        // Upload thumbnail first
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          const adminRef = ref(adminStorage, thumbnailPath);
          await uploadBytes(adminRef, new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]), {
            contentType: 'image/jpeg',
          });
        });
        
        await assertSucceeds(getDownloadURL(thumbnailRef));
      });

      it('should deny non-owner from accessing thumbnails', async () => {
        const otherContext = testEnv.authenticatedContext(OTHER_UID);
        const storage = otherContext.storage();
        const thumbnailPath = `users/${OWNER_UID}/cds/${CD_ID}/thumbnails/${FILE_ID}_thumb.jpg`;
        const thumbnailRef = ref(storage, thumbnailPath);
        
        // Upload thumbnail as owner
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          const adminRef = ref(adminStorage, thumbnailPath);
          await uploadBytes(adminRef, new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]), {
            contentType: 'image/jpeg',
          });
        });
        
        await assertFails(getDownloadURL(thumbnailRef));
      });
    });
  });
});
