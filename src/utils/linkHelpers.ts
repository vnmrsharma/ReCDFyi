/**
 * Utility functions for handling links safely
 */

export interface SafeLinkProps {
  href: string;
  external?: boolean;
}

/**
 * Returns safe attributes for anchor tags
 * Automatically adds security attributes for external links
 * 
 * @param href - The URL to link to
 * @param external - Whether the link is external (opens in new tab)
 * @returns Object with target and rel attributes
 * 
 * @example
 * ```tsx
 * <a href="https://example.com" {...getSafeLinkProps('https://example.com', true)}>
 *   External Link
 * </a>
 * ```
 */
export function getSafeLinkProps(href: string, external: boolean = false) {
  if (external) {
    return {
      target: '_blank' as const,
      rel: 'noopener noreferrer' as const,
    };
  }
  
  return {
    target: undefined,
    rel: undefined,
  };
}

/**
 * Determines if a URL is external based on the href
 * 
 * @param href - The URL to check
 * @returns true if the URL is external (starts with http:// or https://)
 */
export function isExternalUrl(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

/**
 * Returns safe attributes for anchor tags, automatically detecting external links
 * 
 * @param href - The URL to link to
 * @returns Object with target and rel attributes
 * 
 * @example
 * ```tsx
 * <a href="https://example.com" {...getAutoSafeLinkProps('https://example.com')}>
 *   External Link
 * </a>
 * ```
 */
export function getAutoSafeLinkProps(href: string) {
  const external = isExternalUrl(href);
  return getSafeLinkProps(href, external);
}
