/**
 * One-time migration: rewrite shareTokens so document ID == token string,
 * and attach cdSnapshot + filesSnapshot for guest access after rules lock down.
 *
 * Run AFTER deploying the new shareService code but BEFORE or WITH the new rules.
 * Prefer: deploy rules that still allow list briefly, migrate, then rules are already locked.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/migrate-share-tokens.mjs
 *   # or with ADC:
 *   gcloud auth application-default login
 *   node scripts/migrate-share-tokens.mjs
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'kiroween-7d6bb';
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'kiroween-7d6bb.firebasestorage.app';

initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
  storageBucket: BUCKET,
});

const db = getFirestore();
const bucket = getStorage().bucket();

async function signedUrl(storagePath) {
  if (!storagePath) return '';
  try {
    const [url] = await bucket.file(storagePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    });
    return url;
  } catch (error) {
    console.warn(`  signed URL failed for ${storagePath}:`, error.message);
    return '';
  }
}

async function buildSnapshot(cdId) {
  const cdSnap = await db.collection('cds').doc(cdId).get();
  if (!cdSnap.exists) {
    return { cdSnapshot: null, filesSnapshot: [] };
  }
  const cd = cdSnap.data();
  const filesSnap = await db.collection('cds').doc(cdId).collection('files').get();
  const filesSnapshot = [];
  for (const fileDoc of filesSnap.docs) {
    const f = fileDoc.data();
    filesSnapshot.push({
      id: fileDoc.id,
      cdId,
      filename: f.filename,
      originalName: f.originalName,
      fileType: f.fileType,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes || 0,
      storagePath: f.storagePath,
      uploadedAt: f.uploadedAt || Timestamp.now(),
      thumbnailPath: f.thumbnailPath || null,
      downloadURL: await signedUrl(f.storagePath),
    });
  }

  return {
    cdSnapshot: {
      name: cd.name,
      username: cd.username || '',
      label: cd.label || null,
      fileCount: cd.fileCount || filesSnapshot.length,
      storageUsedBytes: cd.storageUsedBytes || 0,
      storageLimitBytes: cd.storageLimitBytes || 0,
      isPublic: !!cd.isPublic,
      createdAt: cd.createdAt || Timestamp.now(),
      updatedAt: cd.updatedAt || Timestamp.now(),
    },
    filesSnapshot,
  };
}

async function main() {
  console.log(`Migrating shareTokens in ${PROJECT_ID}...`);
  const tokens = await db.collection('shareTokens').get();
  console.log(`Found ${tokens.size} tokens`);

  let migrated = 0;
  let skipped = 0;
  let deletedOld = 0;

  for (const tokenDoc of tokens.docs) {
    const data = tokenDoc.data();
    const token = data.token;
    if (!token || typeof token !== 'string') {
      console.warn(`Skipping ${tokenDoc.id}: missing token field`);
      skipped++;
      continue;
    }

    const alreadyCorrectId = tokenDoc.id === token;
    const hasSnapshot = !!data.cdSnapshot && Array.isArray(data.filesSnapshot);

    if (alreadyCorrectId && hasSnapshot) {
      skipped++;
      continue;
    }

    const { cdSnapshot, filesSnapshot } = hasSnapshot
      ? { cdSnapshot: data.cdSnapshot, filesSnapshot: data.filesSnapshot }
      : await buildSnapshot(data.cdId);

    const payload = {
      ...data,
      token,
      cdSnapshot,
      filesSnapshot,
    };

    if (!alreadyCorrectId) {
      const targetRef = db.collection('shareTokens').doc(token);
      const existing = await targetRef.get();
      if (existing.exists && existing.id !== tokenDoc.id) {
        console.warn(`Target ${token} already exists; deleting old ${tokenDoc.id}`);
      }
      await targetRef.set(payload, { merge: true });
      await tokenDoc.ref.delete();
      deletedOld++;
      console.log(`Rewrote ${tokenDoc.id} -> ${token}`);
    } else {
      await tokenDoc.ref.set({ cdSnapshot, filesSnapshot }, { merge: true });
      console.log(`Added snapshot to ${token}`);
    }
    migrated++;
  }

  console.log(JSON.stringify({ migrated, skipped, deletedOld }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
