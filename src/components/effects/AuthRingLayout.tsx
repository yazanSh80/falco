/**
 * AuthRingLayout Component
 * 
 * Purpose: Premium animated ring effect as background for authentication pages.
 * Creates floating, morphing blobs that orbit around the form.
 * 
 * UX Rule: Use ONLY on auth pages (/login, /signup). One WOW effect per page.
 * 
 * Performance Notes:
 * - Uses CSS animations only (GPU accelerated)
 * - Automatically simplified on mobile/touch devices
 * - Respects prefers-reduced-motion
 * - Lightweight compared to canvas-based effects
 * 
 * Reduced Motion Handling:
 * - Falls back to static gradient background
 * 
 * Brand Colors:
 * - BZU Blue: #136F94
 * - Falco Gold: #D4AF37
 * - Accent Teal: #1DA3C6
 */

import React from 'react';
import { useEffectsPreference } from '../../utils/effects';

interface AuthRingLayoutProps {
  children: React.ReactNode;
  /** Title displayed above the form */
  title?: string;
  /** Subtitle displayed below title */
  subtitle?: string;
}

const AuthRingLayout: React.FC<AuthRingLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { canUseHeavyEffects, prefersReducedMotion } = useEffectsPreference();
  const showEffects = canUseHeavyEffects && !prefersReducedMotion;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-dark" />
      
      {/* Animated Ring Blobs */}
      {showEffects && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Gold blob - top left */}
          <div 
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30 blur-3xl animate-blob"
            style={{ 
              background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
              animationDelay: '0s',
            }} 
          />
          
          {/* Blue blob - top right */}
          <div 
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl animate-blob"
            style={{ 
              background: 'radial-gradient(circle, #136F94 0%, transparent 70%)',
              animationDelay: '-2s',
            }} 
          />
          
          {/* Teal blob - bottom */}
          <div 
            className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-blob"
            style={{ 
              background: 'radial-gradient(circle, #1DA3C6 0%, transparent 70%)',
              animationDelay: '-4s',
            }} 
          />
          
          {/* Ring effect - orbiting glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
            <div 
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{ 
                background: 'conic-gradient(from 0deg, transparent 0%, #D4AF37 20%, transparent 40%, #136F94 60%, transparent 80%, #1DA3C6 100%)',
                opacity: 0.1,
                animationDuration: '20s',
              }} 
            />
          </div>
          
          {/* Inner ring - slower rotation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
            <div 
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{ 
                background: 'conic-gradient(from 180deg, transparent 0%, #D4AF37 15%, transparent 30%)',
                opacity: 0.15,
                animationDuration: '15s',
                animationDirection: 'reverse',
              }} 
            />
          </div>
        </div>
      )}
      
      {/* Static gradient overlay for mobile/reduced motion */}
      {!showEffects && (
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-brand/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-gold/10 to-transparent" />
        </div>
      )}
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/50 to-slate-950/80" />
      
      {/* Content container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Optional header */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-white/60 text-lg">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Form container with glass effect */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8">
          {children}
        </div>
      </div>
      
      {/* CSS for custom animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 30px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
        }
      `}</style>
    </div>
  );
};

export default AuthRingLayout;
