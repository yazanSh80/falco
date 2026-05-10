import React from 'react';
import clsx from 'clsx';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  trend?: Array<number>;
  variant?: 'default' | 'brand' | 'gold' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<string, { 
  icon: string; 
  iconDark: string;
  accent: string;
  badgeBg: string;
  badgeBgDark: string;
}> = {
  default: { 
    icon: 'bg-neutral-100 text-neutral-600', 
    iconDark: 'dark:bg-[#28292d] dark:text-[#c0c4cd]',
    accent: 'text-neutral-600',
    badgeBg: 'bg-neutral-100',
    badgeBgDark: 'dark:bg-[#35383d]'
  },
  brand: { 
    icon: 'bg-brand/10 text-brand', 
    iconDark: 'dark:bg-brand/20 dark:text-brand-light',
    accent: 'text-brand dark:text-brand-light',
    badgeBg: 'bg-brand/10',
    badgeBgDark: 'dark:bg-brand/20'
  },
  gold: { 
    icon: 'bg-gold/10 text-gold', 
    iconDark: 'dark:bg-gold/20 dark:text-gold-light',
    accent: 'text-gold dark:text-gold-light',
    badgeBg: 'bg-gold/10',
    badgeBgDark: 'dark:bg-gold/20'
  },
  success: { 
    icon: 'bg-success/10 text-success', 
    iconDark: 'dark:bg-green-500/20 dark:text-green-400',
    accent: 'text-success dark:text-green-400',
    badgeBg: 'bg-success/10',
    badgeBgDark: 'dark:bg-green-500/20'
  },
  warning: { 
    icon: 'bg-warning/10 text-warning', 
    iconDark: 'dark:bg-amber-500/20 dark:text-amber-400',
    accent: 'text-warning dark:text-amber-400',
    badgeBg: 'bg-warning/10',
    badgeBgDark: 'dark:bg-amber-500/20'
  },
  error: { 
    icon: 'bg-error/10 text-error', 
    iconDark: 'dark:bg-red-500/20 dark:text-red-400',
    accent: 'text-error dark:text-red-400',
    badgeBg: 'bg-error/10',
    badgeBgDark: 'dark:bg-red-500/20'
  },
};

const sizeStyles: Record<string, { container: string; title: string; value: string; icon: string }> = {
  sm: { container: 'p-4', title: 'text-body-sm', value: 'text-h4', icon: 'w-8 h-8' },
  md: { container: 'p-5', title: 'text-body', value: 'text-h3', icon: 'w-10 h-10' },
  lg: { container: 'p-6', title: 'text-body-lg', value: 'text-h2', icon: 'w-12 h-12' },
};

// Simple sparkline component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase': return 'text-success dark:text-green-400';
      case 'decrease': return 'text-error dark:text-red-400';
      default: return 'text-neutral-500 dark:text-[#7a7d82]';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case 'increase':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'decrease':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const getTrendColor = () => {
    if (variant === 'brand') return '#136F94';
    if (variant === 'gold') return '#D4AF37';
    if (variant === 'success') return '#22C55E';
    if (variant === 'warning') return '#F59E0B';
    if (variant === 'error') return '#EF4444';
    return '#9CA3AF';
  };

  return (
    <div className={clsx(
      'bg-white dark:bg-[#1b1c20] rounded-2xl',
      'border border-neutral-100 dark:border-[#35383d]',
      'shadow-card dark:shadow-none',
      'transition-all duration-300',
      'hover:shadow-card-hover dark:hover:border-[#454850]',
      sizeStyle.container,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={clsx('text-text-muted dark:text-[#7a7d82] font-medium', sizeStyle.title)}>
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={clsx('font-bold text-text-primary dark:text-white', sizeStyle.value)}>
              {value}
            </span>
            {change && (
              <span className={clsx(
                'flex items-center text-body-sm font-medium px-1.5 py-0.5 rounded',
                variantStyle.badgeBg, variantStyle.badgeBgDark,
                getChangeColor()
              )}>
                {getChangeIcon()}
                <span className="ml-0.5">{Math.abs(change.value)}%</span>
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-body-sm text-text-muted dark:text-[#65666b] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className={clsx(
              'rounded-xl flex items-center justify-center',
              variantStyle.icon,
              variantStyle.iconDark,
              sizeStyle.icon
            )}>
              {icon}
            </div>
          )}
          {trend && trend.length > 1 && (
            <Sparkline data={trend} color={getTrendColor()} />
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card - simpler version with dark mode support
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'brand' | 'gold' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'brand',
  className,
}) => {
  const colorStyles: Record<string, string> = {
    brand: 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light',
    gold: 'bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold-light',
    success: 'bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400',
    warning: 'bg-warning/10 text-warning dark:bg-amber-500/20 dark:text-amber-400',
    error: 'bg-error/10 text-error dark:bg-red-500/20 dark:text-red-400',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-[#28292d] dark:text-[#c0c4cd]',
  };

  return (
    <div className={clsx(
      'bg-white dark:bg-[#1b1c20] rounded-xl',
      'border border-neutral-100 dark:border-[#35383d]',
      'p-4 flex items-center gap-3',
      'transition-all duration-200',
      'hover:border-neutral-200 dark:hover:border-[#454850]',
      className
    )}>
      {icon && (
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colorStyles[color])}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-h4 font-bold text-text-primary dark:text-white">{value}</p>
        <p className="text-body-sm text-text-muted dark:text-[#7a7d82]">{label}</p>
      </div>
    </div>
  );
};

export default KPICard;
