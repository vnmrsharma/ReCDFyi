// Mock constants for testing
export const MAX_STORAGE_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per file
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

export const FOOTER_LINKS = [
  { label: 'About', href: '/about', external: false },
  { label: 'Help', href: '/help', external: false },
  { label: 'Privacy', href: '/privacy', external: false },
  { label: 'Terms', href: '/terms', external: false },
  { label: 'GitHub', href: 'https://github.com/test/recd', external: true },
];

export const APP_VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
