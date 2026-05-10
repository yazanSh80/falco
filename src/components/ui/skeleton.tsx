import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200';
  
  const variantClasses: Record<string, string> = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(baseClasses, variantClasses.text, className)}
            style={{
              ...style,
              width: i === lines - 1 ? '60%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

// Pre-built skeleton patterns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-2xl p-5 border border-neutral-100', className)}>
    <div className="flex items-start gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" className="mb-2" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <div className="mt-4">
      <Skeleton variant="text" lines={3} />
    </div>
    <div className="mt-4 flex gap-2">
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4,
  className 
}) => (
  <div className={clsx('bg-white rounded-2xl border border-neutral-100 overflow-hidden', className)}>
    {/* Header */}
    <div className="flex gap-4 p-4 border-b border-neutral-100 bg-neutral-50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" className="flex-1" height={16} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4 border-b border-neutral-100 last:border-0">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" className="flex-1" height={16} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonKPICard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-2xl p-5 border border-neutral-100', className)}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <Skeleton variant="text" width="60%" height={32} className="mb-2" />
    <Skeleton variant="text" width="30%" height={12} />
  </div>
);

export default Skeleton;
