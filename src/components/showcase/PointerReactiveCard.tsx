/**
 * PointerReactiveCard Component
 * 
 * Purpose: Premium card that reacts to mouse position with 3D tilt and spotlight effect.
 * Creates an impressive interactive experience for demo/showcase pages.
 * 
 * UX Rule: Use ONLY on demo page or admin analytics. Heavy effect - one per page max.
 * 
 * Performance Notes:
 * - Uses CSS transforms (GPU accelerated)
 * - Throttled mouse events for smooth performance
 * - Automatically disabled on touch devices
 * - Respects prefers-reduced-motion
 * 
 * Reduced Motion Handling:
 * - Disables pointer tracking, shows static card
 */

import React, { useState, useRef, useCallback } from 'react';
import { useEffectsPreference, throttle } from '../../utils/effects';

interface PointerReactiveCardProps {
  children: React.ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Max rotation in degrees (default: 15) */
  maxRotation?: number;
  /** Spotlight intensity (default: 0.15) */
  spotlightIntensity?: number;
  /** Border glow color (default: gold) */
  glowColor?: string;
  /** Additional className */
  className?: string;
}

const PointerReactiveCard: React.FC<PointerReactiveCardProps> = ({
  children,
  title,
  subtitle,
  maxRotation = 15,
  spotlightIntensity = 0.15,
  glowColor = '#D4AF37',
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    spotlightX: 50,
    spotlightY: 50,
    isHovering: false,
  });
  
  const { canUseHeavyEffects, prefersReducedMotion } = useEffectsPreference();
  const enableEffect = canUseHeavyEffects && !prefersReducedMotion;

  // Throttled mouse move handler
  const handleMouseMove = useCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableEffect || !cardRef.current) return;
      
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      
      // Calculate mouse position relative to card center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      // Calculate rotation (inverted for natural feel)
      const rotateY = (mouseX / (rect.width / 2)) * maxRotation;
      const rotateX = -(mouseY / (rect.height / 2)) * maxRotation;
      
      // Calculate spotlight position (percentage)
      const spotlightX = ((e.clientX - rect.left) / rect.width) * 100;
      const spotlightY = ((e.clientY - rect.top) / rect.height) * 100;
      
      setStyle({
        rotateX,
        rotateY,
        spotlightX,
        spotlightY,
        isHovering: true,
      });
    }, 16), // ~60fps
    [enableEffect, maxRotation]
  );

  const handleMouseEnter = () => {
    if (enableEffect) {
      setStyle(prev => ({ ...prev, isHovering: true }));
    }
  };

  const handleMouseLeave = () => {
    setStyle({
      rotateX: 0,
      rotateY: 0,
      spotlightX: 50,
      spotlightY: 50,
      isHovering: false,
    });
  };

  return (
    <div 
      className={`relative perspective-1000 ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        className="relative group transition-transform duration-200 ease-out"
        style={{
          transform: enableEffect && style.isHovering
            ? `rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0) rotateY(0) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Border glow effect */}
        <div 
          className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${glowColor}40, transparent, ${glowColor}40)`,
            filter: 'blur(1px)',
          }}
          aria-hidden="true"
        />
        
        {/* Spotlight overlay */}
        {enableEffect && (
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(circle at ${style.spotlightX}% ${style.spotlightY}%, rgba(255,255,255,${spotlightIntensity}), transparent 50%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Card content */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/10 overflow-hidden">
          {/* Shimmer effect on edges */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: enableEffect
                ? `linear-gradient(${style.rotateY * 2 + 135}deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)`
                : 'none',
            }}
            aria-hidden="true"
          />
          
          {/* Content */}
          <div className="relative p-6 md:p-8">
            {/* Title section */}
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-white/60">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {/* Children content */}
            {children}
          </div>
          
          {/* Bottom glow accent */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${glowColor}50, transparent)`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default PointerReactiveCard;
