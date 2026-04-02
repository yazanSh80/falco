import React from 'react';
import clsx from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  variant?: 'default' | 'gradient' | 'ring';
  className?: string;
}

const sizes: Record<string, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-tiny', status: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-4 h-4 border-2' },
};

const statusColors: Record<string, string> = {
  online: 'bg-success',
  offline: 'bg-neutral-400 dark:bg-[#65666b]',
  busy: 'bg-error',
  away: 'bg-warning',
};

// Generate initials from name
const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Generate consistent color from name
const getColorFromName = (name: string): string => {
  const colors = [
    'bg-brand',
    'bg-gold',
    'bg-success',
    'bg-info',
    'bg-warning',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  variant = 'default',
  className,
}) => {
  const sizeConfig = sizes[size];
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : 'bg-neutral-300 dark:bg-[#35383d]';

  const variantStyles = {
    default: 'ring-2 ring-white dark:ring-[#1b1c20]',
    gradient: 'ring-2 ring-transparent bg-gradient-to-br from-brand to-gold p-[2px]',
    ring: 'ring-2 ring-brand dark:ring-brand-light',
  };

  return (
    <div className={clsx('relative inline-flex', className)}>
      {variant === 'gradient' ? (
        <div className={clsx(
          'rounded-full bg-gradient-to-br from-brand to-gold p-[2px]',
          sizeConfig.container
        )}>
          {src ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div
              className={clsx(
                'w-full h-full rounded-full flex items-center justify-center font-semibold text-white',
                'bg-neutral-800 dark:bg-[#1b1c20]',
                sizeConfig.text
              )}
              title={name}
            >
              {initials}
            </div>
          )}
        </div>
      ) : (
        <>
          {src ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className={clsx(
                'rounded-full object-cover',
                variantStyles[variant],
                sizeConfig.container
              )}
            />
          ) : (
            <div
              className={clsx(
                'rounded-full flex items-center justify-center font-semibold text-white',
                variantStyles[variant],
                sizeConfig.container,
                sizeConfig.text,
                bgColor
              )}
              title={name}
            >
              {initials}
            </div>
          )}
        </>
      )}
      
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-white dark:border-[#1b1c20]',
            sizeConfig.status,
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string; }>;
  max?: number;
  size?: AvatarProps['size'];
  variant?: AvatarProps['variant'];
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  variant = 'default',
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const sizeConfig = sizes[size];

  return (
    <div className={clsx('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          variant={variant}
          className="ring-2 ring-white dark:ring-[#1b1c20]"
        />
      ))}
      {remaining > 0 && (
        <div
          className={clsx(
            'rounded-full flex items-center justify-center font-medium',
            'text-text-secondary dark:text-[#c0c4cd]',
            'bg-neutral-100 dark:bg-[#28292d]',
            'ring-2 ring-white dark:ring-[#1b1c20]',
            sizeConfig.container,
            sizeConfig.text
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
