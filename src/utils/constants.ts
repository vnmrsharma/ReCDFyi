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

// AI Metadata settings
export const AI_METADATA_SETTINGS = {
  BATCH_DELAY_MS: 100, // Delay between API calls to avoid rate limits
  MAX_RETRIES: 2, // Number of retries for failed metadata generation
  TIMEOUT_MS: 10000, // Timeout for single file metadata generation
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
export const APP_VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Auth Page Enhancement - Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FORM_TRANSITION: 300,
  BUTTON_PRESS: 100,
  SUCCESS_PULSE: 500,
  ERROR_SHAKE: 300,
  FADE_IN: 300,
  BACKGROUND_GRADIENT: 15000,
  DECORATIVE_SPIN: 10000,
  DECORATIVE_FLOAT: 3000,
  DECORATIVE_TWINKLE: 2000,
} as const;

// Auth Page Enhancement - Color Palette
export const AUTH_COLORS = {
  // Background Gradients
  gradients: {
    primary: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'],
    alternative: ['#ff6b6b', '#ee5a6f', '#c44569', '#a8e6cf', '#56ccf2'],
    minimal: ['#e0e0e0', '#f5f5f5'],
  },
  // Window Chrome
  windowChrome: {
    titleBarStart: '#0997ff',
    titleBarEnd: '#0053ee',
    borderLight: '#dfdfdf',
    borderDark: '#808080',
    background: '#c0c0c0',
  },
  // Interactive States
  interactive: {
    focus: '#0066ff',
    error: '#ff4444',
    success: '#44ff44',
    errorBackground: '#ffebee',
    successBackground: '#e8f5e9',
  },
  // Text Colors
  text: {
    headlineStart: '#667eea',
    headlineEnd: '#764ba2',
    subtext: '#666666',
    white: '#ffffff',
  },
} as const;

// Auth Page Enhancement - Decorative Elements Configuration
export interface DecorativeElement {
  type: string;
  icon: string;
  animation: 'spin' | 'float' | 'twinkle';
}

export interface ElementPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export const DECORATIVE_ELEMENTS: DecorativeElement[] = [
  { type: 'cd', icon: '💿', animation: 'spin' },
  { type: 'note', icon: '🎵', animation: 'float' },
  { type: 'star', icon: '⭐', animation: 'twinkle' },
  { type: 'disc', icon: '📀', animation: 'spin' },
];

export const ELEMENT_POSITIONS: ElementPosition[] = [
  { top: '10%', left: '5%' },
  { top: '15%', right: '8%' },
  { bottom: '20%', left: '10%' },
  { bottom: '15%', right: '5%' },
];

// Auth Page Enhancement - Responsive Breakpoints
export const AUTH_BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 960,
  DESKTOP: 1200,
} as const;

// Auth Page Enhancement - Window Dimensions
export const AUTH_WINDOW_DIMENSIONS = {
  desktop: {
    width: 500,
    minHeight: 400,
    padding: 24,
    borderWidth: 2,
  },
  tablet: {
    width: 400,
    minHeight: 380,
    padding: 20,
    borderWidth: 2,
  },
  mobile: {
    width: 'calc(100% - 32px)',
    minHeight: 'auto',
    padding: 16,
    borderWidth: 1,
  },
} as const;

// Auth Page Enhancement - Typography
export const AUTH_TYPOGRAPHY = {
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  titleBar: {
    fontSize: 11,
    fontWeight: 'bold',
  },
} as const;

// Auth Page Enhancement - Touch Target Sizes (accessibility)
export const MIN_TOUCH_TARGET_SIZE = 44; // pixels (WCAG AA standard)

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
