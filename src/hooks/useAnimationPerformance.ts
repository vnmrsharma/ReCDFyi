/**
 * Hook for optimizing animation performance
 * Automatically manages will-change hints and detects performance issues
 */

import { useEffect, useRef, useState } from 'react';
import { canHandleComplexAnimations, AnimationOptimizer } from '../utils/performanceMonitor';

/**
 * Hook to determine if complex animations should be enabled
 * Based on device capabilities and user preferences
 */
export function useCanAnimateComplex(): boolean {
  const [canAnimate, setCanAnimate] = useState(true);

  useEffect(() => {
    setCanAnimate(canHandleComplexAnimations());
  }, []);

  return canAnimate;
}

/**
 * Hook to optimize element animations with will-change hints
 * Automatically adds/removes will-change at appropriate times
 * 
 * @param properties - CSS properties that will be animated
 * @returns Ref to attach to the animated element
 */
export function useAnimationOptimization<T extends HTMLElement>(
  properties: string[] = ['transform', 'opacity']
) {
  const elementRef = useRef<T>(null);
  const optimizerRef = useRef<AnimationOptimizer>(new AnimationOptimizer());

  useEffect(() => {
    const element = elementRef.current;
    const optimizer = optimizerRef.current;

    if (element) {
      // Prepare animation on mount
      optimizer.prepareAnimation(element, properties);

      // Cleanup on unmount
      return () => {
        optimizer.cleanupAnimation(element);
      };
    }
  }, [properties.join(',')]); // Stable dependency

  return elementRef;
}

/**
 * Hook to detect if animations are causing performance issues
 * Monitors frame rate and adjusts animation complexity
 */
export function useAnimationPerformanceMonitor() {
  const [isPerformant, setIsPerformant] = useState(true);
  const frameTimesRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let lastTime = performance.now();
    const maxSamples = 60; // Monitor last 60 frames

    function checkFrame() {
      const currentTime = performance.now();
      const frameTime = currentTime - lastTime;
      lastTime = currentTime;

      // Track frame times
      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > maxSamples) {
        frameTimesRef.current.shift();
      }

      // Calculate average frame time
      if (frameTimesRef.current.length === maxSamples) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / maxSamples;
        const fps = 1000 / avgFrameTime;

        // If FPS drops below 30, consider it non-performant
        setIsPerformant(fps >= 30);
      }

      rafIdRef.current = requestAnimationFrame(checkFrame);
    }

    rafIdRef.current = requestAnimationFrame(checkFrame);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return isPerformant;
}
