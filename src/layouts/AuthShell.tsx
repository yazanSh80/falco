/**
 * AuthShell Layout Component
 * 
 * Purpose: Premium dark cinematic shell for authentication pages.
 * Full-screen dark background with animated ring effects.
 * 
 * Used on: /login, /signup
 * 
 * Features:
 * - Dark gradient background (slate-950)
 * - Animated blob/ring effects (GPU accelerated)
 * - Glass-morphism card container
 * - Falco branding with gold logo
 * - Respects reduced-motion preferences
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FalcoLogo } from '../components/FalcoLogo';
import { useEffectsPreference } from '../utils/effects';
import { Zap } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
  /** Page title (e.g., "Welcome Back", "Create Account") */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Show logo (default: true) */
  showLogo?: boolean;
}

const AuthShell: React.FC<AuthShellProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
}) => {
  const { canUseHeavyEffects, prefersReducedMotion } = useEffectsPreference();
  const showEffects = canUseHeavyEffects && !prefersReducedMotion;

  // Log effect status in dev mode
  if (import.meta.env.DEV) {
    console.log('[AuthShell] Effects enabled:', showEffects, { canUseHeavyEffects, prefersReducedMotion });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Base dark gradient - always visible */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a1628]" />
      
      {/* Animated Effects Layer */}
      {showEffects && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Gold blob - top left */}
          <div 
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] animate-blob"
            style={{ 
              background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
              animationDelay: '0s',
            }} 
          />
          
          {/* Blue blob - top right */}
          <div 
            className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] animate-blob"
            style={{ 
              background: 'radial-gradient(circle, #136F94 0%, transparent 70%)',
              animationDelay: '-2s',
            }} 
          />
          
          {/* Teal blob - bottom center */}
          <div 
            className="absolute -bottom-48 left-1/4 w-[700px] h-[700px] rounded-full opacity-10 blur-[100px] animate-blob"
            style={{ 
              background: 'radial-gradient(circle, #1DA3C6 0%, transparent 70%)',
              animationDelay: '-4s',
            }} 
          />
          
          {/* Outer Ring - slow rotation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]">
            <div 
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{ 
                background: 'conic-gradient(from 0deg, transparent 0%, #D4AF37 15%, transparent 30%, #136F94 45%, transparent 60%, #1DA3C6 75%, transparent 90%)',
                opacity: 0.08,
                animationDuration: '25s',
              }} 
            />
          </div>
          
          {/* Inner Ring - counter rotation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
            <div 
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{ 
                background: 'conic-gradient(from 180deg, transparent 0%, #D4AF37 10%, transparent 25%, #F4D675 40%, transparent 55%)',
                opacity: 0.12,
                animationDuration: '18s',
                animationDirection: 'reverse',
              }} 
            />
          </div>
          
          {/* Pulsing center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]">
            <div 
              className="absolute inset-0 rounded-full animate-pulse-slow"
              style={{ 
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
              }} 
            />
          </div>
        </div>
      )}
      
      {/* Static fallback for mobile/reduced motion */}
      {!showEffects && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-brand/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-gold/8 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl" />
        </div>
      )}
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo & Branding */}
        {showLogo && (
          <Link to="/" className="flex flex-col items-center mb-8 group">
            <div className="relative">
              <FalcoLogo variant="icon" size="xl" colorMode="gold" />
              {/* Glow behind logo */}
              <div className="absolute inset-0 blur-xl bg-gold/20 rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
                FalcoElectrec
              </span>
              <Zap className="w-5 h-5 text-gold animate-pulse" />
            </div>
          </Link>
        )}
        
        {/* Header */}
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
        
        {/* Glass Card Container */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-black/20 p-6 md:p-8">
          {children}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-sm">
            © 2025 FalcoElectrec • Birzeit University
          </p>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -40px) scale(1.1); }
          50% { transform: translate(-30px, 30px) scale(0.95); }
          75% { transform: translate(30px, 40px) scale(1.05); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .animate-blob {
          animation: blob 12s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthShell;
