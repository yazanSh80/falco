/**
 * WowActionCard Component
 * 
 * Premium interactive action card with 3D tilt and glow effect.
 * Use for quick action buttons on dashboards.
 * 
 * Features:
 * - 3D tilt on mouse move
 * - Spotlight/glow effect following cursor
 * - Smooth hover animations
 * - Falls back to simple hover on mobile/reduced-motion
 */

import React, { useState, useRef, useCallback } from 'react';
import { useEffectsPreference, throttle } from '../../utils/effects';
import { ArrowRight } from 'lucide-react';

interface WowActionCardProps {
  /** Card title */
  title: string;
  /** Description text */
  description: string;
  /** Icon component */
  icon: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Accent color for the icon background */
  accentColor?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Additional badge (e.g., "New", "3 Available") */
  badge?: React.ReactNode;
  /** Additional className */
  className?: string;
}

const WowActionCard: React.FC<WowActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  accentColor = '#136F94',
  disabled = false,
  badge,
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
  const enableEffect = canUseHeavyEffects && !prefersReducedMotion && !disabled;

  const handleMouseMove = useCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableEffect || !cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const rotateY = (mouseX / (rect.width / 2)) * 8;
      const rotateX = -(mouseY / (rect.height / 2)) * 8;
      
      const spotlightX = ((e.clientX - rect.left) / rect.width) * 100;
      const spotlightY = ((e.clientY - rect.top) / rect.height) * 100;
      
      setStyle({
        rotateX,
        rotateY,
        spotlightX,
        spotlightY,
        isHovering: true,
      });
    }, 16),
    [enableEffect]
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
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        onClick={disabled ? undefined : onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative bg-white rounded-2xl p-5 border border-neutral-100 
          shadow-md transition-all duration-200 ease-out overflow-hidden
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:border-neutral-200'}
        `}
        style={{
          transform: enableEffect && style.isHovering
            ? `rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0) rotateY(0) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Spotlight effect */}
        {enableEffect && style.isHovering && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${style.spotlightX}% ${style.spotlightY}%, ${accentColor}15 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Border accent on left */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
          style={{ 
            backgroundColor: accentColor,
            opacity: style.isHovering ? 1 : 0.5,
          }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div 
            className="p-3 rounded-xl transition-transform duration-300 flex-shrink-0"
            style={{ 
              backgroundColor: `${accentColor}10`,
              transform: style.isHovering ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <div style={{ color: accentColor }}>
              {icon}
            </div>
          </div>
          
          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-text-primary truncate transition-colors duration-300"
              style={{ color: style.isHovering ? accentColor : undefined }}
            >
              {title}
            </h3>
            <p className="text-sm text-text-muted truncate">{description}</p>
          </div>

          {/* Badge & Arrow */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge}
            <ArrowRight 
              className="w-5 h-5 text-neutral-300 transition-all duration-300"
              style={{
                color: style.isHovering ? accentColor : undefined,
                transform: style.isHovering ? 'translateX(4px)' : 'translateX(0)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WowActionCard;
