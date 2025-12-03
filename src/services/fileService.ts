/**
 * File service for managing media file operations
 * Handles file upload, retrieval, download, and deletion
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import type { MediaFile, ValidationResult } from '../types';
import {
  COLLECTIONS,
  STORAGE_PATHS,
  MIME_TYPE_TO_CATEGORY,
} from '../utils/constants';
import { validateFile } from './validationService';

/**
 * Converts Firestore document data to MediaFile type
 */
function mapFirestoreToMediaFile(id: string, data: any): MediaFile {
  // Handle both Firestore Timestamp and Date objects
  let uploadedAt: Date;
  if (data.uploadedAt instanceof Date) {
    uploadedAt = data.uploadedAt;
  } else if (data.uploadedAt?.toDate) {
    uploadedAt = data.uploadedAt.toDate();
  } else {
    uploadedAt = new Date();
  }

  return {
    id,
    cdId: data.cdId,
    filename: data.filename,
    originalName: data.originalName,
    fileType: data.fileType,
    mimeType: data.mimeType,
    sizeBytes: data.sizeBytes,
    storagePath: data.storagePath,
    uploadedAt,
    thumbnailPath: data.thumbnailPath,
  };
}

/**
 * Gets the file extension from a filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Determines the file type category from MIME type
 */
function getFileTypeCategory(mimeType: string): 'image' | 'audio' | 'video' {
  return MIME_TYPE_TO_CATEGORY[mimeType] || 'image';
}

/**
 * Uploads a file to Firebase Storage and creates metadata in Firestore
 * @param cdId - The CD to upload to
 * @param userId - The user performing the upload
 * @param file - The file to upload
 * @param onProgress - Callback for upload progress updates (0-100)
 * @returns Promise resolving to the created MediaFile metadata
 * @throws {Error} If file validation fails or upload errors occur
 */
export async function uploadFile(
  cdId: string,
  userId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<MediaFile> {
  try {
    // Generate unique file ID
    const fileId = doc(collection(db, 'temp')).id;
    const extension = getFileExtension(file.name);
    
    // Create storage path
    const storagePath = STORAGE_PATHS.userFiles(userId, cdId, fileId, extension);
    const storageRef = ref(storage, storagePath);

    // Upload file with progress tracking
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          // Handle upload errors with specific messages
          const errorMessage = mapUploadError(error.code, file.name);
          reject(new Error(errorMessage));
        },
        async () => {
          try {
            // Upload complete - create metadata document
            const fileType = getFileTypeCategory(file.type);
            
            const fileMetadata = {
              cdId,
              filename: `${fileId}.${extension}`,
              originalName: file.name,
              fileType,
              mimeType: file.type,
              sizeBytes: file.size,
              storagePath,
              uploadedAt: serverTimestamp(),
              thumbnailPath: null,
            };

            // Add to Firestore
            const filesCollectionRef = collection(
              db,
              COLLECTIONS.CDS,
              cdId,
              COLLECTIONS.FILES
            );
            const docRef = await addDoc(filesCollectionRef, fileMetadata);

            // Update CD storage usage and file count
            const cdDocRef = doc(db, COLLECTIONS.CDS, cdId);
            await updateDoc(cdDocRef, {
              storageUsedBytes: increment(file.size),
              fileCount: increment(1),
              updatedAt: serverTimestamp(),
            });

            // Fetch the created document to get server-generated timestamp
            const createdFile = mapFirestoreToMediaFile(docRef.id, {
              ...fileMetadata,
              uploadedAt: new Date(),
            });

            resolve(createdFile);
          } catch (error: any) {
            reject(new Error(`Failed to create file metadata: ${error.message}`));
          }
        }
      );
    });
  } catch (error: any) {
    throw new Error(`File upload failed: ${error.message}`);
  }
}

/**
 * Retrieves all file metadata for a specific CD
 * @param cdId - ID of the CD
 * @returns Promise resolving to array of MediaFile metadata
 * @throws {Error} If retrieval fails
 */
export async function getFileMetadata(cdId: string): Promise<MediaFile[]> {
  try {
    const filesCollectionRef = collection(
      db,
      COLLECTIONS.CDS,
      cdId,
      COLLECTIONS.FILES
    );
    
    const querySnapshot = await getDocs(filesCollectionRef);
    
    return querySnapshot.docs.map((doc) =>
      mapFirestoreToMediaFile(doc.id, doc.data())
    );
  } catch (error: any) {
    throw new Error(`Failed to retrieve file metadata: ${error.message}`);
  }
}

/**
 * Gets a download URL for a file from Firebase Storage
 * @param filePath - Storage path of the file
 * @returns Promise resolving to the download URL
 * @throws {Error} If URL generation fails
 */
export async function getFileDownloadURL(filePath: string): Promise<string> {
  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    throw new Error(`Failed to get download URL: ${error.message}`);
  }
}

/**
 * Deletes a file from Firebase Storage
 * @param filePath - Storage path of the file to delete
 * @returns Promise that resolves when deletion is complete
 * @throws {Error} If deletion fails
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Validates a file for upload
 * @param file - The file to validate
 * @param remainingSpace - Remaining storage space in bytes
 * @returns ValidationResult with valid flag and error messages
 */
export function validateFileForUpload(
  file: File,
  remainingSpace: number
): ValidationResult {
  return validateFile(file, remainingSpace);
}

/**
 * Maps Firebase Storage upload error codes to user-friendly messages
 * @param errorCode - Firebase Storage error code
 * @param filename - Name of the file being uploaded
 * @returns User-friendly error message
 */
function mapUploadError(errorCode: string, filename: string): string {
  switch (errorCode) {
    case 'storage/unauthorized':
      return `Upload failed: You don't have permission to upload ${filename}`;
    case 'storage/canceled':
      return `Upload canceled: ${filename} upload was stopped`;
    case 'storage/unknown':
      return `Upload failed: An unknown error occurred while uploading ${filename}`;
    case 'storage/object-not-found':
      return `Upload failed: Storage location not found for ${filename}`;
    case 'storage/bucket-not-found':
      return `Upload failed: Storage bucket not configured`;
    case 'storage/project-not-found':
      return `Upload failed: Firebase project not configured`;
    case 'storage/quota-exceeded':
      return `Upload failed: Storage quota exceeded. Please contact support`;
    case 'storage/unauthenticated':
      return `Upload failed: You must be logged in to upload files`;
    case 'storage/retry-limit-exceeded':
      return `Upload failed: Network error. Please check your connection and try again`;
    case 'storage/invalid-checksum':
      return `Upload failed: File ${filename} was corrupted during upload. Please try again`;
    case 'storage/server-file-wrong-size':
      return `Upload failed: File ${filename} size mismatch. Please try again`;
    default:
      return `Upload failed: ${filename} could not be uploaded. Please try again`;
  }
}
