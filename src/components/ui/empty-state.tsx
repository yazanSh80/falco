import React from 'react';
import clsx from 'clsx';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'gold';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const defaultIcons = {
  empty: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  search: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  error: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  success: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const sizes = {
  sm: {
    container: 'py-6 px-4',
    icon: 'w-10 h-10',
    title: 'text-body font-medium',
    description: 'text-body-sm',
  },
  md: {
    container: 'py-10 px-6',
    icon: 'w-14 h-14',
    title: 'text-h4 font-semibold',
    description: 'text-body',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-20 h-20',
    title: 'text-h3 font-semibold',
    description: 'text-body-lg',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const sizeStyles = sizes[size];
  
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center text-center',
      sizeStyles.container,
      className
    )}>
      <div className={clsx(
        'text-neutral-300 mb-4',
        sizeStyles.icon
      )}>
        {icon || defaultIcons.empty}
      </div>
      <h3 className={clsx('text-text-primary mb-1', sizeStyles.title)}>
        {title}
      </h3>
      {description && (
        <p className={clsx('text-text-muted max-w-md mb-6', sizeStyles.description)}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button 
              variant={action.variant || 'primary'} 
              onClick={action.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="ghost" 
              onClick={secondaryAction.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Pre-built empty states
export const NoDataState: React.FC<{ 
  resource?: string; 
  action?: EmptyStateProps['action'];
  className?: string;
}> = ({ resource = 'items', action, className }) => (
  <EmptyState
    icon={defaultIcons.empty}
    title={`No ${resource} yet`}
    description={`When you have ${resource}, they will appear here.`}
    action={action}
    className={className}
  />
);

export const NoSearchResultsState: React.FC<{ 
  query?: string;
  onClear?: () => void;
  className?: string;
}> = ({ query, onClear, className }) => (
  <EmptyState
    icon={defaultIcons.search}
    title="No results found"
    description={query ? `We couldn't find anything matching "${query}". Try different keywords or filters.` : 'Try adjusting your search or filters.'}
    action={onClear ? { label: 'Clear search', onClick: onClear, variant: 'secondary' } : undefined}
    className={className}
  />
);

export const ErrorState: React.FC<{ 
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({ message, onRetry, className }) => (
  <EmptyState
    icon={defaultIcons.error}
    title="Something went wrong"
    description={message || 'An error occurred while loading the data. Please try again.'}
    action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    className={className}
  />
);

export default EmptyState;
