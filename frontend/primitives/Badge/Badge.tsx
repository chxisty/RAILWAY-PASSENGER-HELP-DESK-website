import React, { ComponentProps, ReactNode } from 'react';
import clsx from 'clsx';

export interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'verified' | 'live' | 'offline' | 'accent' | 'neutral' | 'warning';
  size?: 'small' | 'medium';
  pulse?: boolean;
  icon?: ReactNode;
}

export function Badge({
  variant = 'neutral',
  size = 'small',
  pulse = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-md border whitespace-nowrap select-none transition-colors',
        {
          'text-[10px] px-2 py-0.5 gap-1.5': size === 'small',
          'text-xs px-2.5 py-1 gap-1.5': size === 'medium',

          'badge-verified': variant === 'verified',
          'badge-accent': variant === 'accent',
          'badge-live': variant === 'live',
          'badge-offline': variant === 'offline',
          'badge-neutral': variant === 'neutral',
          'badge-warning': variant === 'warning',
        },
        className
      )}
      {...props}
    >
      {pulse && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full shrink-0', {
            'bg-emerald-500 dark:bg-emerald-400': variant === 'live',
            'bg-rose-500 dark:bg-rose-400': variant === 'offline',
            'bg-[#E67E48] dark:bg-[#F6C176]': variant === 'verified' || variant === 'accent',
            'bg-amber-500 dark:bg-amber-400': variant === 'warning',
            'bg-[#7D6B5E] dark:bg-[#A39687]': variant === 'neutral',
          })}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
