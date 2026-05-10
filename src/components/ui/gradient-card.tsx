import React from 'react';
import clsx from 'clsx';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'selected' | 'notification' | 'premium';
  onClick?: () => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
}) => {
  const baseStyles = 'rounded-xl p-4 transition-all duration-300';
  
  const variantStyles = {
    default: clsx(
      'bg-white dark:bg-[#1b1c20]',
      'border border-neutral-200 dark:border-[#35383d]',
      'hover:border-neutral-300 dark:hover:border-[#454850]',
      'hover:shadow-lg dark:hover:shadow-black/20'
    ),
    selected: clsx(
      'bg-gradient-to-r from-brand/5 via-gold/5 to-transparent',
      'dark:from-brand/10 dark:via-gold/10 dark:to-transparent',
      'border-l-4 border-l-brand dark:border-l-brand-light',
      'border-y border-r border-neutral-200 dark:border-[#35383d]'
    ),
    notification: clsx(
      'bg-gradient-to-r from-[#136F94] to-transparent',
      'dark:from-brand/20 dark:to-transparent',
      'border-none',
      'text-white dark:text-white'
    ),
    premium: clsx(
      'relative overflow-hidden',
      'bg-gradient-to-br from-brand/10 via-transparent to-gold/10',
      'dark:from-brand/20 dark:via-[#1b1c20] dark:to-gold/20',
      'border border-transparent',
      'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
      'before:bg-gradient-to-br before:from-brand before:via-transparent before:to-gold',
      'before:-z-10'
    ),
  };

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  );
};

// Gradient bordered card with animated border
interface AnimatedBorderCardProps extends GradientCardProps {
  borderColor?: 'brand' | 'gold' | 'rainbow';
}

export const AnimatedBorderCard: React.FC<AnimatedBorderCardProps> = ({
  children,
  className,
  borderColor = 'brand',
  onClick,
}) => {
  const borderGradients = {
    brand: 'linear-gradient(90deg, #136F94, #1a8ab5, #136F94)',
    gold: 'linear-gradient(90deg, #D4AF37, #e8c65a, #D4AF37)',
    rainbow: 'linear-gradient(90deg, #136F94, #D4AF37, #136F94)',
  };

  return (
    <div className="relative group">
      {/* Animated gradient border */}
      <div 
        className={clsx(
          'absolute -inset-[1px] rounded-xl opacity-50 blur-sm',
          'group-hover:opacity-100 group-hover:blur-none',
          'transition-all duration-300'
        )}
        style={{
          background: borderGradients[borderColor],
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />
      
      {/* Card content */}
      <div
        className={clsx(
          'relative rounded-xl p-4',
          'bg-white dark:bg-[#1b1c20]',
          'border border-transparent',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        {children}
      </div>
    </div>
  );
};

// Campaign-style card like in the reference
interface CampaignCardProps {
  image?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  image,
  title,
  subtitle,
  badge,
  active = false,
  onClick,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer',
        'transition-all duration-200',
        active ? [
          'bg-gradient-to-r from-brand/10 to-transparent',
          'dark:from-brand/20 dark:to-transparent',
          'border-l-2 border-l-brand dark:border-l-brand-light'
        ] : [
          'hover:bg-neutral-100 dark:hover:bg-[#25262a]'
        ],
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      {image && (
        <div className="size-12 rounded-lg overflow-hidden bg-neutral-200 dark:bg-[#28292d] flex-shrink-0">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'font-medium truncate',
            active ? 'text-brand dark:text-brand-light' : 'text-text-primary dark:text-white'
          )}>
            {title}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-brand/20 text-brand dark:bg-brand-light/20 dark:text-brand-light">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-text-muted dark:text-[#7a7d82] truncate">{subtitle}</p>
        )}
      </div>
      
      {/* Divider line */}
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-neutral-200 dark:via-[#35383d] to-transparent" />
    </div>
  );
};

export default GradientCard;
