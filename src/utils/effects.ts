/**
 * Effects Utility for FalcoElectrec
 * 
 * Purpose: Safe detection of user preferences and device capabilities
 * to enable/disable heavy visual effects appropriately.
 * 
 * UX Rule: Always check before enabling heavy effects.
 * Performance: Respects reduced motion and touch devices.
 * 
 * Usage:
 *   import { canEnableHeavyEffects, useEffectsPreference } from '@/utils/effects';
 *   
 *   if (canEnableHeavyEffects()) {
 *     // Enable particle effects, complex animations, etc.
 *   }
 */

/**
 * Check if heavy visual effects should be enabled.
 * 
 * Returns false if:
 * - User prefers reduced motion
 * - Device has coarse pointer (touch/mobile)
 * - Device has low hardware concurrency (optional)
 * 
 * @returns boolean - true if heavy effects are safe to enable
 */
export function canEnableHeavyEffects(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined') return false;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return false;
  
  // Check for coarse pointer (mobile/touch devices)
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (hasCoarsePointer) return false;
  
  // Optional: Check hardware concurrency (number of CPU cores)
  // Low-end devices with 2 or fewer cores should skip heavy effects
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return false;
  }
  
  return true;
}

/**
 * Check if user prefers reduced motion
 * @returns boolean
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if device has a coarse pointer (touch/mobile)
 * @returns boolean
 */
export function hasCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Check if device is mobile based on screen width and pointer
 * @returns boolean
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * React hook to reactively check effects preference
 * Updates when user changes system preferences
 */
import { useState, useEffect } from 'react';

export function useEffectsPreference(): {
  canUseHeavyEffects: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
} {
  const [state, setState] = useState({
    canUseHeavyEffects: false, // Start with false for SSR
    prefersReducedMotion: false,
    isMobile: false,
  });
  
  useEffect(() => {
    // Initial check
    const updateState = () => {
      setState({
        canUseHeavyEffects: canEnableHeavyEffects(),
        prefersReducedMotion: prefersReducedMotion(),
        isMobile: isMobileDevice(),
      });
    };
    
    updateState();
    
    // Listen for preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    
    const handleChange = () => updateState();
    
    motionQuery.addEventListener('change', handleChange);
    pointerQuery.addEventListener('change', handleChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleChange);
      pointerQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return state;
}

/**
 * Debounce helper for performance-sensitive operations
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle helper for high-frequency events like mouse move
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
