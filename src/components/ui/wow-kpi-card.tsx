/**
 * WowKPICard Component
 * 
 * Premium KPI card with electric border effect for dashboard highlights.
 * Use sparingly - max 2 per dashboard for the "wow" factor.
 * 
 * Features:
 * - Animated electric/turbulence border
 * - Glow effect on hover
 * - Trend indicator with sparkline
 * - Falls back to static gold border on mobile/reduced-motion
 */

import React, { useId } from 'react';
import { useEffectsPreference } from '../../utils/effects';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WowKPICardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle */
  subtitle?: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Change percentage */
  change?: number;
  /** Border/accent color */
  accentColor?: string;
  /** Additional className */
  className?: string;
}

const WowKPICard: React.FC<WowKPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  change,
  accentColor = '#D4AF37',
  className = '',
}) => {
  const filterId = useId();
  const { canUseHeavyEffects, prefersReducedMotion } = useEffectsPreference();
  const showEffect = canUseHeavyEffects && !prefersReducedMotion;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-error" />;
    return <Minus className="w-4 h-4 text-neutral-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-neutral-500';
  };

  return (
    <div className={`relative group ${className}`}>
      {/* SVG Filter Definition */}
      {showEffect && (
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <filter id={`wow-kpi-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.02 0.02" 
                numOctaves="2" 
                seed="5"
                result="noise"
              >
                <animate 
                  attributeName="baseFrequency" 
                  values="0.02 0.02;0.025 0.025;0.02 0.02" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
              </feTurbulence>
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                scale="2" 
                xChannelSelector="R" 
                yChannelSelector="G" 
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* Animated Border */}
      <div 
        className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          showEffect 
            ? 'opacity-60 group-hover:opacity-100' 
            : 'opacity-100'
        }`}
        style={{
          background: `linear-gradient(135deg, ${accentColor}40 0%, transparent 50%, ${accentColor}40 100%)`,
          filter: showEffect ? `url(#wow-kpi-${filterId})` : 'none',
        }}
      />
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: `0 0 30px ${accentColor}30, 0 0 60px ${accentColor}20`,
        }}
      />

      {/* Card Content */}
      <div className="relative bg-white rounded-2xl p-5 border border-neutral-100 shadow-md 
                    group-hover:shadow-lg group-hover:border-neutral-200 transition-all duration-300
                    group-hover:-translate-y-0.5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          {icon && (
            <div 
              className="p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <div style={{ color: accentColor }}>
                {icon}
              </div>
            </div>
          )}
          
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              {change !== undefined && <span>{Math.abs(change)}%</span>}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span 
            className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            }}
          >
            {value}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        )}

        {/* Animated accent line */}
        {showEffect && (
          <div 
            className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <div 
              className="h-full w-1/3 rounded-full animate-shimmer"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />
          </div>
        )}
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WowKPICard;
