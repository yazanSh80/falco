import React from 'react';
import clsx from 'clsx';

interface ElectricCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  variant?: 'blue' | 'gold' | 'success' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

// SVG Filter Component - should be rendered once in the app
export const ElectricSVGFilter: React.FC = () => (
  <svg className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="electric-border-filter" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
          <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
          <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="2" />
        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
          <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="2" />
        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
          <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
        <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
        <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

        <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
      </filter>
    </defs>
  </svg>
);

const variantColors = {
  blue: {
    border: 'rgb(19, 111, 148)',
    borderLight: 'rgba(19, 111, 148, 0.5)',
    glow: 'rgba(29, 163, 198, 0.6)',
  },
  gold: {
    border: 'rgb(212, 175, 55)',
    borderLight: 'rgba(212, 175, 55, 0.5)',
    glow: 'rgba(244, 214, 117, 0.6)',
  },
  success: {
    border: 'rgb(34, 197, 94)',
    borderLight: 'rgba(34, 197, 94, 0.5)',
    glow: 'rgba(74, 222, 128, 0.6)',
  },
  purple: {
    border: 'rgb(147, 51, 234)',
    borderLight: 'rgba(147, 51, 234, 0.5)',
    glow: 'rgba(192, 132, 252, 0.6)',
  },
};

const sizeClasses = {
  sm: 'min-h-[200px]',
  md: 'min-h-[300px]',
  lg: 'min-h-[400px]',
};

export const ElectricCard: React.FC<ElectricCardProps> = ({
  children,
  className,
  title,
  subtitle,
  badge,
  variant = 'blue',
  size = 'md',
  animated = true,
}) => {
  const colors = variantColors[variant];

  return (
    <div
      className={clsx(
        'electric-card-container relative rounded-3xl p-[2px]',
        className
      )}
      style={{
        background: `linear-gradient(-30deg, ${colors.borderLight}, transparent, ${colors.borderLight}), linear-gradient(to bottom, rgb(17, 24, 39), rgb(17, 24, 39))`,
      }}
    >
      {/* Inner container with border effects */}
      <div className="electric-inner relative">
        {/* Outer border */}
        <div
          className="electric-border-outer rounded-3xl p-[4px]"
          style={{ border: `2px solid ${colors.borderLight}` }}
        >
          {/* Main animated border */}
          <div
            className={clsx(
              'electric-main-border rounded-3xl -mt-1 -ml-1',
              sizeClasses[size]
            )}
            style={{
              border: `2px solid ${colors.border}`,
              filter: animated ? 'url(#electric-border-filter)' : 'none',
            }}
          />
        </div>

        {/* Glow layers */}
        <div
          className="electric-glow-1 absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            border: `2px solid ${colors.glow}`,
            filter: 'blur(1px)',
          }}
        />
        <div
          className="electric-glow-2 absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            border: `2px solid ${colors.border}`,
            filter: 'blur(4px)',
          }}
        />
      </div>

      {/* Overlay effects */}
      <div
        className="absolute inset-0 rounded-3xl opacity-100 mix-blend-overlay pointer-events-none"
        style={{
          transform: 'scale(1.1)',
          filter: 'blur(16px)',
          background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)',
        }}
      />
      <div
        className="absolute inset-0 rounded-3xl opacity-50 mix-blend-overlay pointer-events-none"
        style={{
          transform: 'scale(1.1)',
          filter: 'blur(16px)',
          background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)',
        }}
      />

      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-3xl -z-10 pointer-events-none"
        style={{
          filter: 'blur(32px)',
          transform: 'scale(1.1)',
          opacity: 0.3,
          background: `linear-gradient(-30deg, ${colors.glow}, transparent, ${colors.border})`,
        }}
      />

      {/* Content */}
      <div className="electric-content absolute inset-0 flex flex-col">
        {/* Top section with badge and title */}
        {(badge || title) && (
          <div className="flex flex-col p-6 pb-4">
            {badge && (
              <div
                className="electric-badge w-fit px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{
                  background: `radial-gradient(47.2% 50% at 50.39% 88.37%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.04)`,
                  color: 'rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                }}
              >
                <span className="relative z-10">{badge}</span>
                {/* Glass border */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    padding: '1px',
                    background: 'linear-gradient(150deg, rgba(255, 255, 255, 0.48) 16.73%, rgba(255, 255, 255, 0.08) 30.2%, rgba(255, 255, 255, 0.08) 68.2%, rgba(255, 255, 255, 0.6) 81.89%)',
                    borderRadius: 'inherit',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor',
                    WebkitMaskComposite: 'xor',
                  }}
                />
              </div>
            )}
            {title && (
              <h3 className="text-2xl font-medium text-white mt-auto pt-4">
                {title}
              </h3>
            )}
          </div>
        )}

        {/* Divider */}
        {(badge || title) && subtitle && (
          <hr
            className="border-none h-px mx-6"
            style={{
              background: 'currentColor',
              opacity: 0.1,
              maskImage: 'linear-gradient(to right, transparent, black, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
            }}
          />
        )}

        {/* Subtitle */}
        {subtitle && (
          <div className="px-6 pt-4">
            <p className="text-white/50 text-sm">{subtitle}</p>
          </div>
        )}

        {/* Custom content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Compact version for smaller cards
export const ElectricCardCompact: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'blue' | 'gold' | 'success' | 'purple';
  onClick?: () => void;
}> = ({ children, className, variant = 'blue', onClick }) => {
  const colors = variantColors[variant];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'electric-card-compact relative rounded-2xl p-[1px] cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      style={{
        background: `linear-gradient(-30deg, ${colors.borderLight}, transparent, ${colors.borderLight}), linear-gradient(to bottom, rgb(17, 24, 39), rgb(17, 24, 39))`,
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl -z-10 opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none"
        style={{
          filter: 'blur(20px)',
          transform: 'scale(1.05)',
          background: `linear-gradient(-30deg, ${colors.glow}, transparent, ${colors.border})`,
        }}
      />

      {/* Inner content */}
      <div
        className="relative rounded-2xl p-4 backdrop-blur-xl"
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: `1px solid ${colors.borderLight}`,
        }}
      >
        {children}
      </div>

      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
        style={{
          border: `1px solid ${colors.border}`,
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
};

export default ElectricCard;
