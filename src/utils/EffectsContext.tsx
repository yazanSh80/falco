/**
 * Effects Context
 * 
 * Purpose: Global state for visual effects toggle.
 * Allows users to enable/disable effects independently of system preferences.
 * 
 * Features:
 * - Persists user preference to localStorage
 * - Respects system prefers-reduced-motion as default
 * - Provides hook for components to check effects status
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { prefersReducedMotion, isMobileDevice, canEnableHeavyEffects } from './effects';

interface EffectsContextValue {
  /** Whether effects are currently enabled */
  effectsEnabled: boolean;
  /** Toggle effects on/off */
  toggleEffects: () => void;
  /** Set effects explicitly */
  setEffectsEnabled: (enabled: boolean) => void;
  /** Whether system prefers reduced motion */
  systemPrefersReducedMotion: boolean;
  /** Whether device is mobile */
  isMobile: boolean;
  /** Combined check: effects enabled AND device capable */
  canShowEffects: boolean;
}

const EffectsContext = createContext<EffectsContextValue | null>(null);

const STORAGE_KEY = 'falco_effects_enabled';

export function EffectsProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or system preference
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    
    // Default: ON for desktop, OFF for mobile/reduced-motion
    return canEnableHeavyEffects();
  });
  
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Update system preferences on mount and changes
  useEffect(() => {
    const updateSystemPrefs = () => {
      setSystemPrefersReducedMotion(prefersReducedMotion());
      setIsMobile(isMobileDevice());
    };
    
    updateSystemPrefs();
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', updateSystemPrefs);
    
    return () => motionQuery.removeEventListener('change', updateSystemPrefs);
  }, []);
  
  // Persist to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(effectsEnabled));
  }, [effectsEnabled]);
  
  const toggleEffects = () => setEffectsEnabled(prev => !prev);
  
  // Combined check: user wants effects AND device can handle them
  const canShowEffects = effectsEnabled && !systemPrefersReducedMotion && !isMobile;
  
  const value: EffectsContextValue = {
    effectsEnabled,
    toggleEffects,
    setEffectsEnabled,
    systemPrefersReducedMotion,
    isMobile,
    canShowEffects,
  };
  
  return (
    <EffectsContext.Provider value={value}>
      {children}
    </EffectsContext.Provider>
  );
}

export function useEffectsContext(): EffectsContextValue {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffectsContext must be used within EffectsProvider');
  }
  return context;
}

export default EffectsContext;
