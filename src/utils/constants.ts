/**
 * Application constants for ReCd platform
 */

// Storage limits
export const MAX_STORAGE_BYTES = 20 * 1024 * 1024; // 20 MB per CD
export const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per video file
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB per non-video file

// Allowed file types by category
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png'],
  audio: ['audio/mp3', 'audio/mpeg', 'audio/wav'],
  video: ['video/mp4'],
} as const;

// Flattened list of all allowed MIME types
export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_FILE_TYPES.image,
  ...ALLOWED_FILE_TYPES.audio,
  ...ALLOWED_FILE_TYPES.video,
];

// Allowed file extensions
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'mp3', 'wav', 'mp4'] as const;

// MIME type to file type category mapping
export const MIME_TYPE_TO_CATEGORY: Record<string, 'image' | 'audio' | 'video'> = {
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'audio/mp3': 'audio',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'video/mp4': 'video',
};

// Share token settings
export const DEFAULT_TOKEN_EXPIRATION_DAYS = 30;
export const SHARE_TOKEN_LENGTH = 32; // characters

// Validation patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_CD_NAME_LENGTH = 100;
export const MIN_CD_NAME_LENGTH = 1;

// Username validation
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;

// Firebase Storage paths
export const STORAGE_PATHS = {
  userFiles: (userId: string, cdId: string, fileId: string, extension: string) =>
    `users/${userId}/cds/${cdId}/files/${fileId}.${extension}`,
  userThumbnails: (userId: string, cdId: string, fileId: string) =>
    `users/${userId}/cds/${cdId}/thumbnails/${fileId}_thumb.jpg`,
} as const;

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  CDS: 'cds',
  FILES: 'files',
  SHARE_TOKENS: 'shareTokens',
  EMAIL_LOGS: 'emailLogs',
  USERNAMES: 'usernames',
  PUBLIC_CDS: 'publicCDs',
  CD_VIEWS: 'cdViews',
} as const;

// Marketplace settings
export const MARKETPLACE_PAGE_SIZE = 20; // CDs per page
export const ANALYTICS_PAGE_SIZE = 50; // Viewers per page
export const MAX_USERNAME_SUGGESTIONS = 3; // Number of alternative usernames to suggest

// Footer links
export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export const FOOTER_LINKS: FooterLink[] = [
  { label: 'About', href: '/about', external: false },
  { label: 'Help', href: '/help', external: false },
  { label: 'Privacy', href: '/privacy', external: false },
  { label: 'Terms', href: '/terms', external: false },
];

// App version information
// App version information
// Default values for test environments
export const APP_VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Error messages
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Invalid file type. Allowed formats: jpg, png, mp3, wav, mp4',
  FILE_TOO_LARGE: 'File is too large. Maximum size: 5 MB for videos, 20 MB for other files',
  CD_CAPACITY_EXCEEDED: 'CD capacity exceeded. Maximum storage: 20 MB per CD',
  INVALID_EMAIL: 'Please enter a valid email address',
  WEAK_PASSWORD: 'Password must be at least 6 characters',
  INVALID_CD_NAME: 'CD name must be between 1 and 100 characters',
  SHARE_TOKEN_INVALID: 'This share link is invalid or has been revoked',
  SHARE_TOKEN_EXPIRED: 'This share link has expired. Please request a new link from the owner',
  UNAUTHORIZED: "You don't have permission to access this resource",
  CD_NOT_FOUND: 'This CD no longer exists',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  USERNAME_TAKEN: 'This username is already taken',
  INVALID_USERNAME_FORMAT: 'Username must be 3-20 characters, letters, numbers, and underscores only',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
  USERNAME_TOO_LONG: 'Username must be 20 characters or less',
  PUBLIC_TOGGLE_FAILED: 'Failed to update CD visibility. Please try again',
  PUBLIC_CD_NOT_FOUND: 'This public CD no longer exists or has been made private',
  PRIVATE_CD_ACCESS_DENIED: 'This CD is private and you don\'t have access',
  MARKETPLACE_LOAD_FAILED: 'Failed to load marketplace. Please refresh',
  SEARCH_FAILED: 'Search temporarily unavailable. Please try again',
  NO_SEARCH_RESULTS: 'No public CDs match your search. Try different keywords',
  ANALYTICS_LOAD_FAILED: 'Failed to load view analytics. Please try again',
  ANALYTICS_PERMISSION_DENIED: 'You don\'t have permission to view these analytics',
} as const;
