import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'highlight' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderColor?: string;
}

const cardVariants: Record<string, string> = {
  default: `
    bg-white rounded-2xl shadow-card border border-neutral-100
    dark:bg-slate-800/70 dark:border-slate-700/50 dark:shadow-lg dark:shadow-black/20
    dark:backdrop-blur-xl transition-colors duration-300
  `,
  interactive: `
    bg-white rounded-2xl shadow-card border border-neutral-100 
    cursor-pointer transition-all duration-200 
    hover:shadow-card-hover hover:border-brand/20 hover:-translate-y-0.5 active:translate-y-0
    dark:bg-slate-800/70 dark:border-slate-700/50 dark:shadow-lg dark:shadow-black/20
    dark:hover:border-brand/30 dark:hover:shadow-xl dark:hover:shadow-brand/10
    dark:backdrop-blur-xl
  `,
  highlight: `
    bg-white rounded-2xl shadow-card border-l-4
    dark:bg-slate-800/70 dark:shadow-lg dark:shadow-black/20
    dark:backdrop-blur-xl transition-colors duration-300
  `,
  elevated: `
    bg-white rounded-2xl shadow-soft-md border border-neutral-100
    dark:bg-slate-800/80 dark:border-slate-700/50 dark:shadow-xl dark:shadow-black/30
    dark:backdrop-blur-xl transition-colors duration-300
  `,
};

const paddingSizes: Record<string, string> = {
  none: '',
  sm: 'p-3 md:p-4',
  md: 'p-4 md:p-5',
  lg: 'p-5 md:p-6',
};

export const Card: React.FC<CardProps> = ({ 
  variant = 'default',
  padding = 'md',
  borderColor,
  className, 
  style,
  ...rest 
}) => (
  <div 
    className={clsx(cardVariants[variant], paddingSizes[padding], className)} 
    style={{ borderLeftColor: variant === 'highlight' ? borderColor : undefined, ...style }}
    {...rest} 
  />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={clsx('mb-4', className)} {...rest} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => (
  <h3 className={clsx('text-h4 font-semibold text-text-primary dark:text-white', className)} {...rest} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...rest }) => (
  <p className={clsx('text-body-sm text-text-muted mt-1 dark:text-slate-400', className)} {...rest} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={clsx('', className)} {...rest} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={clsx('mt-4 pt-4 border-t border-neutral-100 dark:border-slate-700/50 flex items-center gap-2', className)} {...rest} />
);

export default Card;
