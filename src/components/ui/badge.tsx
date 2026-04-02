import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const variants: Record<string, string> = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-[#35383d] dark:text-[#c0c4cd]',
  success: 'bg-success/10 text-success-dark dark:bg-green-500/20 dark:text-green-400',
  warning: 'bg-warning/10 text-warning-dark dark:bg-amber-500/20 dark:text-amber-400',
  error: 'bg-error/10 text-error-dark dark:bg-red-500/20 dark:text-red-400',
  info: 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light',
  gold: 'bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold-light',
  outline: 'bg-transparent border border-neutral-300 text-neutral-600 dark:border-[#454850] dark:text-[#c0c4cd]',
};

const sizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-tiny',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  size = 'md',
  dot,
  className, 
  children,
  ...rest 
}) => (
  <span 
    className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
      variants[variant], 
      sizes[size],
      className
    )} 
    {...rest}
  >
    {dot && (
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        variant === 'success' && 'bg-success dark:bg-green-400',
        variant === 'warning' && 'bg-warning dark:bg-amber-400',
        variant === 'error' && 'bg-error dark:bg-red-400',
        variant === 'info' && 'bg-brand dark:bg-brand-light',
        variant === 'gold' && 'bg-gold dark:bg-gold-light',
        variant === 'default' && 'bg-neutral-400 dark:bg-[#65666b]',
        variant === 'outline' && 'bg-neutral-400 dark:bg-[#65666b]',
      )} />
    )}
    {children}
  </span>
);

export default Badge;