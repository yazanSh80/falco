import { Loader2 } from 'lucide-react';

/**
 * Full page loading component
 * Used as fallback for lazy-loaded routes
 */
export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated spinner */}
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 blur-xl bg-amber-500/20 rounded-full" />
      </div>
      
      {/* Loading text */}
      <p className="mt-4 text-gray-400 text-sm animate-pulse">
        جاري التحميل...
      </p>
    </div>
  );
}

/**
 * Skeleton loader for cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gray-700/50 p-4 flex gap-4">
        <div className="h-4 bg-gray-600 rounded w-1/4" />
        <div className="h-4 bg-gray-600 rounded w-1/4" />
        <div className="h-4 bg-gray-600 rounded w-1/4" />
        <div className="h-4 bg-gray-600 rounded w-1/4" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-t border-gray-700/50 flex gap-4">
          <div className="h-4 bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-700 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for stats cards
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-700 rounded-lg" />
            <div className="h-3 bg-gray-700 rounded w-16" />
          </div>
          <div className="h-8 bg-gray-700 rounded w-20 mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Inline loading spinner
 */
export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  return (
    <Loader2 className={`${sizeClasses[size]} text-amber-500 animate-spin`} />
  );
}
