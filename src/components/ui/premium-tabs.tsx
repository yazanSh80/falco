import React from 'react';
import clsx from 'clsx';

interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  count?: number;
}

interface PremiumTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PremiumTabs: React.FC<PremiumTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const variantStyles = {
    default: {
      container: 'bg-neutral-100 dark:bg-[#1b1c20] p-1 rounded-xl',
      tab: clsx(
        'rounded-lg transition-all duration-200',
        'text-text-secondary dark:text-[#7a7d82]',
        'hover:text-text-primary dark:hover:text-white'
      ),
      activeTab: clsx(
        'bg-white dark:bg-[#28292d]',
        'text-text-primary dark:text-white',
        'shadow-sm dark:shadow-none'
      ),
    },
    pills: {
      container: 'flex gap-2',
      tab: clsx(
        'rounded-full transition-all duration-200',
        'border border-transparent',
        'text-text-secondary dark:text-[#7a7d82]',
        'hover:bg-neutral-100 dark:hover:bg-[#1b1c20]',
        'hover:text-text-primary dark:hover:text-white'
      ),
      activeTab: clsx(
        'bg-brand/10 dark:bg-brand/20',
        'border-brand/30 dark:border-brand-light/30',
        'text-brand dark:text-brand-light'
      ),
    },
    underline: {
      container: 'flex border-b border-neutral-200 dark:border-[#35383d]',
      tab: clsx(
        'relative transition-all duration-200 border-b-2 border-transparent -mb-px',
        'text-text-secondary dark:text-[#7a7d82]',
        'hover:text-text-primary dark:hover:text-white'
      ),
      activeTab: clsx(
        'border-brand dark:border-brand-light',
        'text-brand dark:text-brand-light'
      ),
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={clsx(styles.container, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'flex items-center justify-center gap-2 font-medium',
            sizeStyles[size],
            styles.tab,
            activeTab === tab.value && styles.activeTab
          )}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={clsx(
              'px-1.5 py-0.5 text-[10px] font-semibold rounded-full',
              activeTab === tab.value
                ? 'bg-brand/20 text-brand dark:bg-brand-light/20 dark:text-brand-light'
                : 'bg-neutral-200 text-neutral-600 dark:bg-[#35383d] dark:text-[#c0c4cd]'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// Campaign Slider Component
interface SliderItem {
  id: string;
  image?: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface CampaignSliderProps {
  items: SliderItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export const CampaignSlider: React.FC<CampaignSliderProps> = ({
  items,
  activeId,
  onSelect,
  className,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      {/* Navigation buttons */}
      <button
        onClick={() => scroll('left')}
        className={clsx(
          'absolute left-2 top-1/2 -translate-y-1/2 z-20',
          'w-8 h-8 rounded-full',
          'bg-white dark:bg-[#1b1c20]',
          'border border-neutral-200 dark:border-[#35383d]',
          'flex items-center justify-center',
          'text-text-muted dark:text-[#7a7d82]',
          'hover:bg-neutral-100 dark:hover:bg-[#25262a]',
          'transition-all duration-200'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll('right')}
        className={clsx(
          'absolute right-2 top-1/2 -translate-y-1/2 z-20',
          'w-8 h-8 rounded-full',
          'bg-white dark:bg-[#1b1c20]',
          'border border-neutral-200 dark:border-[#35383d]',
          'flex items-center justify-center',
          'text-text-muted dark:text-[#7a7d82]',
          'hover:bg-neutral-100 dark:hover:bg-[#25262a]',
          'transition-all duration-200'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slider content */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-12 py-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            className={clsx(
              'flex-shrink-0 w-40 p-3 rounded-xl cursor-pointer',
              'transition-all duration-200',
              activeId === item.id ? [
                'bg-gradient-to-br from-brand/10 to-gold/10',
                'dark:from-brand/20 dark:to-gold/20',
                'border-2 border-brand/50 dark:border-brand-light/50'
              ] : [
                'bg-neutral-50 dark:bg-[#1b1c20]',
                'border border-neutral-200 dark:border-[#35383d]',
                'hover:border-neutral-300 dark:hover:border-[#454850]'
              ]
            )}
          >
            {/* Image */}
            {item.image && (
              <div className="w-full h-20 rounded-lg overflow-hidden mb-2 bg-neutral-200 dark:bg-[#28292d]">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="flex items-center gap-1 mb-1">
              <span className={clsx(
                'text-sm font-medium truncate',
                activeId === item.id 
                  ? 'text-brand dark:text-brand-light' 
                  : 'text-text-primary dark:text-white'
              )}>
                {item.title}
              </span>
              {item.badge && (
                <span className="px-1 py-0.5 text-[9px] font-medium rounded bg-brand/20 text-brand dark:text-brand-light">
                  {item.badge}
                </span>
              )}
            </div>
            {item.subtitle && (
              <p className="text-xs text-text-muted dark:text-[#7a7d82] truncate">
                {item.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumTabs;
