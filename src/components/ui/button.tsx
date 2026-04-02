import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const base = `
  inline-flex items-center justify-center gap-2 font-medium 
  transition-all duration-200 ease-out 
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 
  disabled:opacity-50 disabled:pointer-events-none
`;

const variants: Record<string, string> = {
  primary: `
    bg-brand text-white rounded-xl shadow-brand 
    hover:bg-brand-dark hover:-translate-y-0.5 hover:shadow-brand-lg 
    active:translate-y-0 active:shadow-brand
    dark:bg-gradient-to-r dark:from-brand dark:to-brand-light
    dark:hover:shadow-xl dark:hover:shadow-brand/40
  `,
  secondary: `
    bg-white border-2 border-brand text-brand rounded-xl 
    hover:bg-brand/5 hover:-translate-y-0.5 
    active:translate-y-0
    dark:bg-slate-800 dark:border-brand-light dark:text-brand-light
    dark:hover:bg-slate-700
  `,
  outline: `
    border border-neutral-300 text-text-secondary rounded-lg bg-white
    hover:bg-neutral-50 hover:border-brand-light hover:text-brand
    dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-200
    dark:hover:bg-slate-700 dark:hover:border-brand-light dark:hover:text-brand-light
  `,
  ghost: `
    text-text-secondary rounded-lg 
    hover:bg-neutral-100 hover:text-text-primary
    dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white
  `,
  destructive: `
    bg-semantic-error text-white rounded-xl shadow-md 
    hover:bg-red-600 hover:-translate-y-0.5 
    active:translate-y-0
    dark:bg-red-600 dark:hover:bg-red-500
  `,
  gold: `
    bg-gradient-gold text-page-dark font-semibold rounded-xl shadow-gold
    hover:-translate-y-0.5 hover:shadow-lg
    active:translate-y-0
    dark:shadow-gold/40 dark:hover:shadow-gold/60
  `
};

const sizes: Record<string, string> = {
  xs: 'h-7 px-2.5 text-caption',
  sm: 'h-9 px-3 text-body-sm',
  md: 'h-11 px-4 text-body-sm',
  lg: 'h-12 px-6 text-body'
};

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  leftIcon,
  rightIcon,
  asChild = false,
  className, 
  children,
  disabled,
  ...rest 
}) => {
  const buttonClasses = clsx(base, variants[variant], sizes[size], className);
  
  // If asChild is true, clone the child element with button styles
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: clsx(buttonClasses, (children as React.ReactElement<any>).props.className),
    });
  }
  
  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon}
      {!asChild && children}
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
