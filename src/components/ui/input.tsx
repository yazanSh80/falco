import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  className, 
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  id,
  ...rest 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-body-sm font-medium text-text-secondary dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}
        <input 
          ref={ref} 
          id={inputId}
          className={clsx(
            'w-full rounded-xl bg-white border px-3.5 py-2.5 text-body text-text-primary',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200',
            // Dark mode styles
            'dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500',
            'dark:focus:ring-offset-slate-900',
            error 
              ? 'border-error focus:border-error focus:ring-error/20 dark:border-red-500 dark:focus:ring-red-500/30' 
              : 'border-neutral-200 focus:border-brand focus:ring-brand/20 dark:border-slate-600 dark:focus:border-brand-light dark:focus:ring-brand-light/30',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )} 
          {...rest} 
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-body-sm text-error flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-body-sm text-text-muted">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
