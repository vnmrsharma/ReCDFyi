/**
 * Core type definitions for ReCd platform
 */

export interface User {
  uid: string;
  email: string;
  username?: string; // Optional for backward compatibility, will be required after migration
  displayName?: string;
  publicCDCount?: number;
}

export interface CD {
  id: string;
  userId: string;
  username: string;
  name: string;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
  storageUsedBytes: number;
  storageLimitBytes: number;
  fileCount: number;
  isPublic: boolean;
  publicAt?: Date;
  viewCount: number;
}

export interface MediaFile {
  id: string;
  cdId: string;
  filename: string;
  originalName: string;
  fileType: 'image' | 'audio' | 'video';
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  uploadedAt: Date;
  thumbnailPath?: string;
}

export interface ShareToken {
  id: string;
  cdId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  createdBy: string;
  accessCount: number;
}

export interface EmailLogData {
  userId: string;
  recipientEmail: string;
  subject: string;
  cdId: string;
  cdName: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

export interface EmailLog extends EmailLogData {
  id: string;
  sentAt: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface UploadProgress {
  fileIndex: number;
  totalFiles: number;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export type FileTypeCategory = 'image' | 'audio' | 'video';

// Public Marketplace Types

export interface PublicCD {
  id: string;
  userId: string;
  username: string;
  name: string;
  label?: string;
  fileCount: number;
  createdAt: Date;
  publicAt: Date;
  viewCount: number;
  thumbnailUrl?: string;
}

export interface UserProfile {
  username: string;
  joinDate: Date;
  publicCDCount: number;
  publicCDs: PublicCD[];
}

export interface ViewRecord {
  username: string;
  viewedAt: Date;
  viewCount: number;
}

export interface ViewAnalytics {
  totalViews: number;
  uniqueViewers: number;
  viewers: ViewRecord[];
}

export interface MarketplaceQueryOptions {
  sortBy?: 'newest' | 'oldest' | 'mostViewed';
  limit?: number;
  startAfter?: string;
  creatorUsername?: string;
}
