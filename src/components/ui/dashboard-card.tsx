/**
 * Premium Dashboard Card Components
 * Dark mode aware card components for admin and other dashboards
 */

import React from 'react';
import clsx from 'clsx';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'highlight' | 'glass';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: clsx(
      'bg-white dark:bg-[#1b1c20]',
      'border border-neutral-100 dark:border-[#35383d]',
      'shadow-card dark:shadow-none',
      'hover:shadow-card-hover dark:hover:border-[#454850]'
    ),
    gradient: clsx(
      'bg-gradient-to-br from-neutral-50 to-neutral-100',
      'dark:from-[#1b1c20] dark:to-[#252628]',
      'border border-neutral-200 dark:border-[#35383d]'
    ),
    highlight: clsx(
      'bg-gradient-to-br from-brand/5 to-gold/5',
      'dark:from-brand/10 dark:to-gold/10',
      'border border-brand/20 dark:border-brand/30'
    ),
    glass: clsx(
      'backdrop-blur-xl',
      'bg-white/80 dark:bg-[#1b1c20]/80',
      'border border-white/20 dark:border-[#35383d]/50'
    ),
  };

  return (
    <div
      className={clsx(
        'rounded-xl p-5 transition-all duration-300',
        variantStyles[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card Header
interface CardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const DashboardCardHeader: React.FC<CardHeaderProps> = ({
  icon,
  title,
  subtitle,
  badge,
  action,
  className,
}) => (
  <div className={clsx('flex items-start justify-between mb-4', className)}>
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2.5 bg-neutral-100 dark:bg-[#252628] rounded-xl">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-[#7a7d82]">{subtitle}</p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {badge}
      {action}
    </div>
  </div>
);

// Status Badge for health checks
interface StatusBadgeProps {
  status: 'online' | 'degraded' | 'offline' | 'loading';
  label?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
}) => {
  const styles = {
    online: 'bg-emerald-50 text-emerald-700 dark:bg-green-500/20 dark:text-green-400',
    degraded: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    offline: 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    loading: 'bg-neutral-100 text-neutral-600 dark:bg-[#35383d] dark:text-[#c0c4cd]',
  };

  const icons = {
    online: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    degraded: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    offline: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    loading: (
      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
  };

  const labels = {
    online: 'Online',
    degraded: 'Degraded',
    offline: 'Offline',
    loading: 'Loading...',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      styles[status]
    )}>
      {showIcon && icons[status]}
      {label || labels[status]}
    </span>
  );
};

// Progress bar for charts
interface ProgressBarProps {
  segments: Array<{ value: number; color: string; label?: string }>;
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SegmentedProgress: React.FC<ProgressBarProps> = ({
  segments,
  showLabels = false,
  height = 'md',
  className,
}) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const heights = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={className}>
      <div className={clsx(
        'rounded-full overflow-hidden flex',
        'bg-neutral-100 dark:bg-[#252628]',
        heights[height]
      )}>
        {segments.map((segment, index) => (
          <div
            key={index}
            className="transition-all duration-500"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-4 mt-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <p className="text-neutral-500 dark:text-[#7a7d82]">{segment.label}</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{segment.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Metric display
interface MetricProps {
  label: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease' | 'neutral' };
  icon?: React.ReactNode;
  color?: string;
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  change,
  icon,
  color = '#136F94',
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      {icon && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
      )}
      <span className="text-neutral-600 dark:text-[#c0c4cd]">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-semibold text-neutral-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      {change && (
        <span className={clsx(
          'text-xs font-medium px-1.5 py-0.5 rounded',
          change.type === 'increase' && 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
          change.type === 'decrease' && 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
          change.type === 'neutral' && 'bg-neutral-100 text-neutral-600 dark:bg-[#35383d] dark:text-[#c0c4cd]'
        )}>
          {change.type === 'increase' && '+'}
          {change.type === 'decrease' && '-'}
          {Math.abs(change.value)}%
        </span>
      )}
    </div>
  </div>
);

export default DashboardCard;
