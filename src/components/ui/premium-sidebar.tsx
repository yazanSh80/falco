import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  active?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface PremiumSidebarProps {
  sections: SidebarSection[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const PremiumSidebar: React.FC<PremiumSidebarProps> = ({
  sections,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  className,
}) => {
  return (
    <aside className={clsx(
      'flex flex-col h-full',
      'bg-white dark:bg-[#0a0a0a]',
      'border-l border-neutral-200 dark:border-[#1b1c20]',
      'transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      {header && (
        <div className={clsx(
          'p-4 border-b border-neutral-200 dark:border-[#1b1c20]',
          collapsed && 'px-2'
        )}>
          {header}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={clsx('mb-6', collapsed && 'mb-4')}>
            {/* Section Title */}
            {section.title && !collapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-text-muted dark:text-[#65666b] uppercase tracking-wider">
                {section.title}
              </h3>
            )}

            {/* Items */}
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => clsx(
                      'group flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg',
                      'transition-all duration-200',
                      isActive || item.active ? [
                        'bg-gradient-to-r from-brand/10 to-transparent',
                        'dark:from-brand/20 dark:to-transparent',
                        'border-r-2 border-brand dark:border-brand-light',
                        'text-brand dark:text-brand-light'
                      ] : [
                        'text-text-secondary dark:text-[#c0c4cd]',
                        'hover:bg-neutral-100 dark:hover:bg-[#1b1c20]',
                        'hover:text-text-primary dark:hover:text-white'
                      ],
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Icon */}
                    <span className={clsx(
                      'flex-shrink-0 w-5 h-5',
                      'transition-transform duration-200',
                      'group-hover:scale-110'
                    )}>
                      {item.icon}
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span className="flex-1 text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {item.badge && !collapsed && (
                      <span className={clsx(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        'bg-brand/10 text-brand',
                        'dark:bg-brand/20 dark:text-brand-light'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={clsx(
            'absolute top-4 -left-3',
            'w-6 h-6 rounded-full',
            'bg-white dark:bg-[#1b1c20]',
            'border border-neutral-200 dark:border-[#35383d]',
            'flex items-center justify-center',
            'text-text-muted dark:text-[#7a7d82]',
            'hover:bg-neutral-100 dark:hover:bg-[#25262a]',
            'transition-all duration-200'
          )}
        >
          {collapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Footer */}
      {footer && (
        <div className={clsx(
          'p-4 border-t border-neutral-200 dark:border-[#1b1c20]',
          collapsed && 'px-2'
        )}>
          {footer}
        </div>
      )}
    </aside>
  );
};

// User Card for Sidebar
interface UserCardProps {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  collapsed?: boolean;
  onClick?: () => void;
}

export const SidebarUserCard: React.FC<UserCardProps> = ({
  name,
  email,
  avatar,
  role,
  collapsed = false,
  onClick,
}) => {
  return (
    <div 
      className={clsx(
        'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
        'hover:bg-neutral-100 dark:hover:bg-[#1b1c20]',
        'transition-all duration-200',
        collapsed && 'justify-center'
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className={clsx(
        'flex-shrink-0 rounded-full overflow-hidden',
        'bg-gradient-to-br from-brand to-gold',
        collapsed ? 'w-8 h-8' : 'w-10 h-10'
      )}>
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary dark:text-white truncate">
            {name}
          </p>
          {email && (
            <p className="text-xs text-text-muted dark:text-[#7a7d82] truncate">
              {email}
            </p>
          )}
        </div>
      )}

      {/* Role Badge */}
      {role && !collapsed && (
        <span className={clsx(
          'px-2 py-0.5 text-[10px] font-medium rounded-full uppercase',
          'bg-brand/10 text-brand',
          'dark:bg-brand/20 dark:text-brand-light'
        )}>
          {role}
        </span>
      )}
    </div>
  );
};

export default PremiumSidebar;
