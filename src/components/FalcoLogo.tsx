import React from 'react';
import clsx from 'clsx';

interface FalcoLogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorMode?: 'brand' | 'gold' | 'white' | 'dark';
  className?: string;
}

const sizes: Record<string, { icon: number; text: string; gap: string }> = {
  xs: { icon: 24, text: 'text-sm', gap: 'gap-1' },
  sm: { icon: 32, text: 'text-base', gap: 'gap-1.5' },
  md: { icon: 40, text: 'text-lg', gap: 'gap-2' },
  lg: { icon: 48, text: 'text-xl', gap: 'gap-2.5' },
  xl: { icon: 64, text: 'text-2xl', gap: 'gap-3' },
};

const colors: Record<string, { falcon: string; electric: string; text: string }> = {
  brand: { falcon: '#D4AF37', electric: '#136F94', text: 'text-text-primary' },
  gold: { falcon: '#D4AF37', electric: '#D4AF37', text: 'text-gold' },
  white: { falcon: '#FFFFFF', electric: '#FFFFFF', text: 'text-white' },
  dark: { falcon: '#1F2937', electric: '#1F2937', text: 'text-text-primary' },
};

// Golden Falcon SVG Icon
const FalconIcon: React.FC<{ size: number; falconColor: string; electricColor: string }> = ({ 
  size, 
  falconColor, 
  electricColor 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Falco Logo"
  >
    {/* Circle background with gradient */}
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={electricColor} stopOpacity="0.1" />
        <stop offset="100%" stopColor={electricColor} stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="falconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={falconColor} />
        <stop offset="50%" stopColor={falconColor} />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
    </defs>
    
    {/* Background circle */}
    <circle cx="32" cy="32" r="30" fill="url(#bgGradient)" stroke={electricColor} strokeWidth="1.5" strokeOpacity="0.2" />
    
    {/* Falcon silhouette - stylized diving falcon */}
    <g transform="translate(12, 10)">
      {/* Main body */}
      <path
        d="M20 4 
           C24 4 28 8 30 14
           L38 22
           C38 22 36 26 32 28
           L28 32
           C26 34 24 36 20 38
           C16 36 14 34 12 32
           L8 28
           C4 26 2 22 2 22
           L10 14
           C12 8 16 4 20 4Z"
        fill="url(#falconGradient)"
      />
      
      {/* Wing left */}
      <path
        d="M10 14
           C6 16 2 20 2 22
           L8 20
           C10 18 12 16 14 14
           L10 14Z"
        fill={falconColor}
        opacity="0.9"
      />
      
      {/* Wing right */}
      <path
        d="M30 14
           C34 16 38 20 38 22
           L32 20
           C30 18 28 16 26 14
           L30 14Z"
        fill={falconColor}
        opacity="0.9"
      />
      
      {/* Head detail */}
      <ellipse
        cx="20"
        cy="10"
        rx="6"
        ry="4"
        fill={falconColor}
      />
      
      {/* Eye */}
      <circle cx="18" cy="9" r="1.5" fill={electricColor} />
      
      {/* Beak */}
      <path
        d="M14 10 L12 12 L14 14 L16 12 Z"
        fill={electricColor}
      />
      
      {/* Lightning bolt on chest */}
      <path
        d="M22 20 L18 26 L21 26 L19 32 L26 24 L22 24 L24 20 Z"
        fill={electricColor}
        opacity="0.9"
      />
      
      {/* Tail feathers */}
      <path
        d="M20 38 
           C18 40 16 42 14 44
           M20 38
           C22 40 24 42 26 44
           M20 38
           L20 46"
        stroke={falconColor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  </svg>
);

export const FalcoLogo: React.FC<FalcoLogoProps> = ({
  variant = 'full',
  size = 'md',
  colorMode = 'brand',
  className,
}) => {
  const sizeConfig = sizes[size];
  const colorConfig = colors[colorMode];

  if (variant === 'icon') {
    return (
      <div className={className}>
        <FalconIcon 
          size={sizeConfig.icon} 
          falconColor={colorConfig.falcon} 
          electricColor={colorConfig.electric} 
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={clsx('font-bold tracking-tight', sizeConfig.text, colorConfig.text, className)}>
        Falco<span className="text-brand">Electrec</span>
      </span>
    );
  }

  return (
    <div className={clsx('flex items-center', sizeConfig.gap, className)}>
      <FalconIcon 
        size={sizeConfig.icon} 
        falconColor={colorConfig.falcon} 
        electricColor={colorConfig.electric} 
      />
      <div className="flex flex-col">
        <span className={clsx('font-bold tracking-tight leading-none', sizeConfig.text, colorConfig.text)}>
          Falco<span className="text-brand">Electrec</span>
        </span>
        <span className="text-tiny text-text-muted uppercase tracking-wider">
          Electrical Services
        </span>
      </div>
    </div>
  );
};

// Simple text logo for compact spaces
export const FalcoLogoSimple: React.FC<{ className?: string }> = ({ className }) => (
  <span className={clsx('font-bold tracking-tight', className)}>
    <span className="text-gold">Falco</span>
    <span className="text-brand">Electrec</span>
  </span>
);

export default FalcoLogo;
