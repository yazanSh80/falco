import React from 'react';
import clsx from 'clsx';
import { 
  Eye, ShoppingBasket, Zap, TrendingUp, TrendingDown,
  DollarSign, Users, Star, Clock, CheckCircle, Bell
} from 'lucide-react';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  percentage?: number;
  variant?: 'purple' | 'orange' | 'neutral' | 'brand' | 'gold' | 'success';
  icon?: React.ReactNode;
  time?: string;
  className?: string;
}

const variantStyles = {
  purple: {
    iconBg: 'bg-[#ac9ac6]',
    iconColor: 'text-[#3c3c55]',
    badgeBg: 'bg-[#5b4d77]',
    badgeColor: 'text-white',
  },
  orange: {
    iconBg: 'bg-[#c4877e]',
    iconColor: 'text-[#553a35]',
    badgeBg: 'bg-[#553a35]',
    badgeColor: 'text-white',
  },
  neutral: {
    iconBg: 'bg-[#d9c1b3]',
    iconColor: 'text-[#806d63]',
    badgeBg: 'bg-[#806d63]',
    badgeColor: 'text-white',
  },
  brand: {
    iconBg: 'bg-brand/20 dark:bg-brand-light/20',
    iconColor: 'text-brand dark:text-brand-light',
    badgeBg: 'bg-brand/20 dark:bg-brand-light/20',
    badgeColor: 'text-brand dark:text-brand-light',
  },
  gold: {
    iconBg: 'bg-gold/20',
    iconColor: 'text-gold dark:text-gold-light',
    badgeBg: 'bg-gold/20',
    badgeColor: 'text-gold dark:text-gold-light',
  },
  success: {
    iconBg: 'bg-success/20',
    iconColor: 'text-success dark:text-green-400',
    badgeBg: 'bg-success/20',
    badgeColor: 'text-success dark:text-green-400',
  },
};

export const PremiumStatCard: React.FC<PremiumStatCardProps> = ({
  title,
  value,
  percentage,
  variant = 'brand',
  icon,
  time = 'current',
  className,
}) => {
  const styles = variantStyles[variant];
  const isPositive = percentage && percentage > 0;

  return (
    <div className={clsx(
      'p-4 rounded-xl transition-all duration-300',
      'bg-white dark:bg-[#1b1c20]',
      'border border-neutral-200 dark:border-[#35383d]',
      'hover:border-neutral-300 dark:hover:border-[#454850]',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold text-text-primary dark:text-white">{title}</span>
        <div className="size-5 grid place-items-center rounded-full bg-neutral-100 dark:bg-[#28292d] text-neutral-400 dark:text-[#65666b]">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={clsx(
          'size-10 grid place-items-center rounded-full',
          styles.iconBg, styles.iconColor
        )}>
          {icon || <TrendingUp className="size-5" />}
        </div>

        {/* Value */}
        <div className="text-xl font-semibold text-text-primary dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {/* Percentage Badge */}
        {percentage !== undefined && (
          <div className={clsx(
            'px-2 py-0.5 rounded-md text-xs font-medium',
            styles.badgeBg, styles.badgeColor
          )}>
            {isPositive ? '+' : ''}{percentage}%
          </div>
        )}
      </div>

      {/* Time indicator */}
      {time && (
        <div className="mt-2 text-xs text-text-muted dark:text-[#7a7d82]">
          {time}
        </div>
      )}
    </div>
  );
};

// Preset cards
export const ViewsStatCard: React.FC<Omit<PremiumStatCardProps, 'title' | 'icon' | 'variant'>> = (props) => (
  <PremiumStatCard
    title="Views"
    icon={<Eye className="size-5" />}
    variant="purple"
    {...props}
  />
);

export const RedemptionsStatCard: React.FC<Omit<PremiumStatCardProps, 'title' | 'icon' | 'variant'>> = (props) => (
  <PremiumStatCard
    title="Redemptions"
    icon={<ShoppingBasket className="size-5" />}
    variant="orange"
    {...props}
  />
);

export const CodeClipsStatCard: React.FC<Omit<PremiumStatCardProps, 'title' | 'icon' | 'variant'>> = (props) => (
  <PremiumStatCard
    title="Code Clips"
    icon={<Zap className="size-5" />}
    variant="neutral"
    {...props}
  />
);

export default PremiumStatCard;
