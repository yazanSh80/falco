import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  className, 
  label,
  error,
  hint,
  id,
  children, 
  ...rest 
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-body-sm font-medium text-text-secondary dark:text-[#c0c4cd] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select 
          id={selectId}
          className={clsx(
            'w-full rounded-xl bg-white dark:bg-[#1b1c20] border px-3.5 py-2.5 text-body text-text-primary dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200',
            'appearance-none cursor-pointer',
            error 
              ? 'border-error focus:border-error focus:ring-error/20 dark:border-red-500' 
              : 'border-neutral-200 dark:border-[#35383d] focus:border-brand dark:focus:border-brand-light focus:ring-brand/20 dark:focus:ring-brand-light/20',
            className
          )} 
          {...rest}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 dark:text-[#65666b]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-body-sm text-error dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-body-sm text-text-muted dark:text-[#7a7d82]">{hint}</p>
      )}
    </div>
  );
};

export default Select;
