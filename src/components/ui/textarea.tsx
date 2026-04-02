import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  className, 
  label,
  error,
  hint,
  id,
  ...rest 
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-body-sm font-medium text-text-secondary dark:text-[#c0c4cd] mb-1.5">
          {label}
        </label>
      )}
      <textarea 
        id={textareaId}
        className={clsx(
          'w-full rounded-xl bg-white dark:bg-[#1b1c20] border px-3.5 py-2.5 text-body text-text-primary dark:text-white',
          'placeholder:text-neutral-400 dark:placeholder:text-[#65666b]',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200',
          'resize-none min-h-[100px]',
          error 
            ? 'border-error focus:border-error focus:ring-error/20 dark:border-red-500' 
            : 'border-neutral-200 dark:border-[#35383d] focus:border-brand dark:focus:border-brand-light focus:ring-brand/20 dark:focus:ring-brand-light/20',
          className
        )} 
        {...rest} 
      />
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

export default Textarea;
