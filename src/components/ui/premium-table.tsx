import React from 'react';
import clsx from 'clsx';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface PremiumTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  compact?: boolean;
}

export function PremiumTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  className,
  compact = false,
}: PremiumTableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={clsx(
      'overflow-hidden rounded-xl',
      'border border-neutral-200 dark:border-[#35383d]',
      'bg-white dark:bg-[#1b1c20]',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 dark:bg-[#252628]">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    compact ? 'px-3 py-2' : 'px-4 py-3',
                    'text-xs font-semibold uppercase tracking-wider',
                    'text-text-muted dark:text-[#65666b]',
                    'border-b border-neutral-200 dark:border-[#35383d]',
                    alignClasses[column.align || 'left'],
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-[#252628]">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className={compact ? 'px-3 py-2' : 'px-4 py-4'}>
                      <div className="h-4 bg-neutral-200 dark:bg-[#35383d] rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length}
                  className={clsx(
                    compact ? 'px-3 py-8' : 'px-4 py-12',
                    'text-center text-text-muted dark:text-[#7a7d82]'
                  )}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  className={clsx(
                    'transition-colors duration-150',
                    onRowClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#252628]'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={clsx(
                        compact ? 'px-3 py-2' : 'px-4 py-4',
                        'text-sm text-text-primary dark:text-white',
                        alignClasses[column.align || 'left'],
                        column.className
                      )}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : String(row[column.accessor] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Table action buttons
interface TableActionProps {
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  tooltip?: string;
}

export const TableAction: React.FC<TableActionProps> = ({
  icon,
  onClick,
  variant = 'default',
  tooltip,
}) => {
  const variantStyles = {
    default: 'text-text-muted dark:text-[#7a7d82] hover:text-brand dark:hover:text-brand-light hover:bg-brand/10',
    danger: 'text-text-muted dark:text-[#7a7d82] hover:text-error dark:hover:text-red-400 hover:bg-error/10',
    success: 'text-text-muted dark:text-[#7a7d82] hover:text-success dark:hover:text-green-400 hover:bg-success/10',
    warning: 'text-text-muted dark:text-[#7a7d82] hover:text-warning dark:hover:text-amber-400 hover:bg-warning/10',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        'p-1.5 rounded-lg transition-all duration-150',
        variantStyles[variant]
      )}
      title={tooltip}
    >
      {icon}
    </button>
  );
};

// Table badge for status columns
interface TableBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'gold';
}

export const TableBadge: React.FC<TableBadgeProps> = ({
  children,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-600 dark:bg-[#35383d] dark:text-[#c0c4cd]',
    success: 'bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400',
    warning: 'bg-warning/10 text-warning dark:bg-amber-500/20 dark:text-amber-400',
    error: 'bg-error/10 text-error dark:bg-red-500/20 dark:text-red-400',
    info: 'bg-info/10 text-info dark:bg-blue-500/20 dark:text-blue-400',
    brand: 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light',
    gold: 'bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold-light',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variantStyles[variant]
    )}>
      {children}
    </span>
  );
};

export default PremiumTable;
