/**
 * Performance monitoring utilities for auth page animations
 * Helps identify performance bottlenecks and optimize rendering
 */

/**
 * Measures animation frame rate over a period
 * @param duration - Duration to measure in milliseconds
 * @returns Average FPS during the measurement period
 */
export function measureAnimationFPS(duration: number = 1000): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = performance.now();
    let lastTime = startTime;

    function countFrame() {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - startTime < duration) {
        requestAnimationFrame(countFrame);
      } else {
        const elapsed = currentTime - startTime;
        const fps = (frameCount / elapsed) * 1000;
        resolve(Math.round(fps));
      }
    }

    requestAnimationFrame(countFrame);
  });
}

/**
 * Checks if device can handle complex animations
 * Based on hardware capabilities and performance
 * @returns true if device can handle complex animations
 */
export function canHandleComplexAnimations(): boolean {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // Check for low-end device indicators
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  
  // Check device memory if available (Chrome only)
  const memory = (navigator as any).deviceMemory || 4;

  // Low-end device: mobile with few cores and low memory
  if (isMobile && cores < 4 && memory < 4) {
    return false;
  }

  return true;
}

/**
 * Optimizes animation performance by adjusting CSS properties
 * Adds will-change hints when animations are about to start
 */
export class AnimationOptimizer {
  private elements: Set<HTMLElement> = new Set();

  /**
   * Prepare element for animation by adding will-change hint
   * @param element - Element to optimize
   * @param properties - CSS properties that will change
   */
  prepareAnimation(element: HTMLElement, properties: string[] = ['transform', 'opacity']) {
    if (!element) return;

    element.style.willChange = properties.join(', ');
    this.elements.add(element);
  }

  /**
   * Clean up after animation completes
   * Removes will-change to free up resources
   * @param element - Element to clean up
   */
  cleanupAnimation(element: HTMLElement) {
    if (!element) return;

    element.style.willChange = 'auto';
    this.elements.delete(element);
  }

  /**
   * Clean up all tracked elements
   */
  cleanupAll() {
    this.elements.forEach(element => {
      element.style.willChange = 'auto';
    });
    this.elements.clear();
  }
}

/**
 * Debounces animation triggers to prevent excessive repaints
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounceAnimation<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 16 // ~1 frame at 60fps
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

/**
 * Throttles animation updates to match frame rate
 * @param callback - Function to throttle
 * @returns Throttled function
 */
export function throttleAnimation<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  let rafId: number | undefined;
  let lastArgs: Parameters<T> | undefined;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (rafId === undefined) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          callback(...lastArgs);
        }
        rafId = undefined;
      });
    }
  };
}

/**
 * Logs performance metrics for debugging
 * Only logs in development mode
 */
export function logPerformanceMetrics(label: string, metrics: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}:`, metrics);
  }
}
