import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface DashboardNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface DashboardNavProps {
  items: DashboardNavItem[];
  className?: string;
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  items,
  className,
}) => {
  const location = useLocation();

  return (
    <nav className={clsx(
      'flex items-center gap-1 p-1 rounded-xl',
      'bg-neutral-100 dark:bg-[#1b1c20]',
      className
    )}>
      {items.map((item, index) => {
        const isActive = location.pathname === item.href;
        
        return (
          <NavLink
            key={index}
            to={item.href}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'text-sm font-medium',
              'transition-all duration-200',
              isActive ? [
                'bg-white dark:bg-[#28292d]',
                'text-brand dark:text-brand-light',
                'shadow-sm dark:shadow-none'
              ] : [
                'text-text-secondary dark:text-[#7a7d82]',
                'hover:text-text-primary dark:hover:text-white',
                'hover:bg-white/50 dark:hover:bg-[#252628]'
              ]
            )}
          >
            {item.icon && (
              <span className="w-4 h-4">{item.icon}</span>
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className={clsx(
                'px-1.5 py-0.5 text-[10px] font-semibold rounded-full',
                isActive
                  ? 'bg-brand/20 text-brand dark:bg-brand-light/20 dark:text-brand-light'
                  : 'bg-neutral-200 text-neutral-600 dark:bg-[#35383d] dark:text-[#c0c4cd]'
              )}>
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

// Breadcrumb component
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
}) => {
  return (
    <nav className={clsx('flex items-center gap-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="w-4 h-4 text-text-muted dark:text-[#65666b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <NavLink
              to={item.href}
              className="text-text-muted dark:text-[#7a7d82] hover:text-brand dark:hover:text-brand-light transition-colors"
            >
              {item.label}
            </NavLink>
          ) : (
            <span className="text-text-primary dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Section header with optional action
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
}) => {
  return (
    <div className={clsx('flex items-center justify-between', className)}>
      <div>
        <h2 className="text-lg font-semibold text-text-primary dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-muted dark:text-[#7a7d82] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Page header with breadcrumb and title
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}) => {
  return (
    <div className={clsx('mb-6', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} className="mb-3" />
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary dark:text-[#7a7d82] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default DashboardNav;
