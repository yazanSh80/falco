/**
 * ElectricBorderCard Component
 * 
 * Purpose: Premium card with animated electric/turbulence border effect.
 * Uses SVG filters to create a dynamic, glowing border animation.
 * 
 * UX Rule: Use ONCE per page as a highlight card only.
 * 
 * Performance Notes:
 * - SVG filter-based (GPU accelerated)
 * - Automatically falls back to static border on unsupported browsers
 * - Respects prefers-reduced-motion
 * 
 * Reduced Motion Handling:
 * - Shows static gold border instead of animated effect
 * 
 * Attribution/License:
 * - Electric border effect using SVG turbulence filter
 * - Adapted for React + TypeScript
 */

import React, { useId } from 'react';
import { useEffectsPreference } from '../../utils/effects';

interface ElectricBorderCardProps {
  children: React.ReactNode;
  /** Card title */
  title?: string;
  /** Card icon (Lucide icon component) */
  icon?: React.ReactNode;
  /** Border color (default: Falco Gold) */
  borderColor?: string;
  /** Glow color (default: matches border) */
  glowColor?: string;
  /** Additional className */
  className?: string;
}

const ElectricBorderCard: React.FC<ElectricBorderCardProps> = ({
  children,
  title,
  icon,
  borderColor = '#D4AF37',
  glowColor,
  className = '',
}) => {
  const filterId = useId();
  const { canUseHeavyEffects, prefersReducedMotion } = useEffectsPreference();
  const showEffect = canUseHeavyEffects && !prefersReducedMotion;
  const effectiveGlowColor = glowColor || borderColor;

  return (
    <div className={`relative group ${className}`}>
      {/* SVG Filter Definition (hidden) */}
      {showEffect && (
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <filter id={`electric-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
              {/* Turbulence for electric effect */}
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.015 0.015" 
                numOctaves="3" 
                seed="1"
                result="noise"
              >
                <animate 
                  attributeName="baseFrequency" 
                  values="0.015 0.015;0.02 0.02;0.015 0.015" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </feTurbulence>
              
              {/* Displacement map for electric distortion */}
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                scale="3" 
                xChannelSelector="R" 
                yChannelSelector="G" 
              />
            </filter>
            
            {/* Glow filter */}
            <filter id={`glow-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={effectiveGlowColor} floodOpacity="0.6" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      )}

      {/* Animated border container */}
      <div 
        className="absolute -inset-[2px] rounded-2xl overflow-hidden"
        style={{
          filter: showEffect ? `url(#electric-${filterId})` : undefined,
        }}
      >
        {/* Animated gradient border */}
        <div 
          className={`absolute inset-0 ${showEffect ? 'animate-border-rotate' : ''}`}
          style={{
            background: showEffect 
              ? `conic-gradient(from 0deg, ${borderColor}, #136F94, ${borderColor}, #1DA3C6, ${borderColor})`
              : borderColor,
            opacity: showEffect ? 1 : 0.5,
          }}
        />
        
        {/* Inner cutout */}
        <div className="absolute inset-[2px] rounded-xl bg-slate-900" />
      </div>

      {/* Glow effect on hover */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ backgroundColor: `${effectiveGlowColor}20` }}
        aria-hidden="true"
      />

      {/* Card content */}
      <div 
        className="relative bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-xl p-6 md:p-8 border border-white/5"
        style={{
          filter: showEffect ? `url(#glow-${filterId})` : undefined,
        }}
      >
        {/* Icon and title */}
        {(icon || title) && (
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${borderColor}20` }}
              >
                <div style={{ color: borderColor }}>
                  {icon}
                </div>
              </div>
            )}
            {title && (
              <h3 className="text-xl font-semibold text-white">
                {title}
              </h3>
            )}
          </div>
        )}
        
        {/* Children content */}
        {children}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes border-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-border-rotate {
          animation: border-rotate 8s linear infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-border-rotate {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ElectricBorderCard;
