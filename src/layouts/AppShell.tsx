/**
 * AppShell Layout Component
 * 
 * Purpose: Light-themed shell for dashboard/app pages.
 * Provides consistent layout, branding, and optional effects toggle.
 * 
 * Used on: All customer/engineer/admin dashboard pages
 * 
 * Features:
 * - Light gradient background (dark mode: solid black)
 * - Subtle decorative elements
 * - Page fade-in animation
 * - Respects reduced-motion
 */

import React from 'react';
import { useEffectsPreference } from '../utils/effects';

interface AppShellProps {
  children: React.ReactNode;
  /** Optional page title for header */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show decorative background elements (default: true) */
  showDecor?: boolean;
  /** Max width class (default: max-w-6xl) */
  maxWidth?: string;
}

const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  subtitle,
  showDecor = true,
  maxWidth = 'max-w-6xl',
}) => {
  const { prefersReducedMotion } = useEffectsPreference();
  
  return (
    <div className={`relative flex-1 py-6 ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
      {/* Subtle background decoration */}
      {showDecor && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Top right gradient orb */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-radial from-brand/5 dark:from-brand/10 to-transparent rounded-full blur-3xl" />
          {/* Bottom left gradient orb */}
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-radial from-gold/5 dark:from-gold/10 to-transparent rounded-full blur-2xl" />
        </div>
      )}
      
      {/* Content - centered with max-width */}
      <div className={`relative ${maxWidth} mx-auto px-4 md:px-8`}>
        {/* Optional header */}
        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-h2 font-bold text-text-primary dark:text-white">{title}</h1>
            )}
            {subtitle && (
              <p className="text-body text-text-secondary dark:text-[#7a7d82] mt-1">{subtitle}</p>
            )}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default AppShell;
