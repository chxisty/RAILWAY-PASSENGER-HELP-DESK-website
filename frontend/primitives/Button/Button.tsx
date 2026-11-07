import React, { ComponentProps, ReactNode, forwardRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'cyan' | 'destructive' | 'outline' | 'forest';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  iconButton?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      icon,
      iconPosition = 'left',
      iconButton = false,
      isLoading = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl cursor-pointer',
          {
            // Sizes
            'text-xs px-3 py-1.5 gap-1.5': size === 'small' && !iconButton,
            'text-sm px-4 py-2 gap-2': size === 'medium' && !iconButton,
            'text-sm px-5 py-2.5 gap-2': size === 'large' && !iconButton,
            'p-1.5': iconButton && size === 'small',
            'p-2': iconButton && size !== 'small',

            // Variants
            'bg-[#E9793D] dark:bg-[#F18445] hover:bg-[#D46A34] dark:hover:bg-[#E9793D] text-white shadow-md shadow-orange-950/30':
              variant === 'primary' || variant === 'cyan',
            'bg-[#234E41] hover:bg-[#1A3E34] text-white shadow-md shadow-emerald-950/30':
              variant === 'forest',
            'bg-white dark:bg-[#211A2D] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] text-[#251B32] dark:text-[#FFF8F0] border border-[#E7D5C1] dark:border-[#493B55] shadow-sm':
              variant === 'secondary',
            'text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-[#FFF8F0] hover:bg-[#F3EBDD] dark:hover:bg-[#292137]':
              variant === 'subtle',
            'bg-transparent border border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:text-[#251B32] dark:hover:text-[#FFF8F0]':
              variant === 'outline',
            'bg-[#DC2626] dark:bg-[#EF4444] hover:bg-rose-700 text-white shadow-sm':
              variant === 'destructive',
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        )}
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="shrink-0">{icon}</span>
        )}
        {children}
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'cyan' | 'destructive' | 'outline' | 'forest';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  iconButton?: boolean;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      icon,
      iconPosition = 'left',
      iconButton = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Link
        ref={ref}
        target="_self"
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] select-none rounded-xl cursor-pointer',
          {
            // Sizes
            'text-xs px-3 py-1.5 gap-1.5': size === 'small' && !iconButton,
            'text-sm px-4 py-2 gap-2': size === 'medium' && !iconButton,
            'text-sm px-5 py-2.5 gap-2': size === 'large' && !iconButton,
            'p-1.5': iconButton && size === 'small',
            'p-2': iconButton && size !== 'small',

            // Variants
            'bg-[#E9793D] dark:bg-[#F18445] hover:bg-[#D46A34] dark:hover:bg-[#E9793D] text-white shadow-md shadow-orange-950/30':
              variant === 'primary' || variant === 'cyan',
            'bg-[#234E41] hover:bg-[#1A3E34] text-white shadow-md shadow-emerald-950/30':
              variant === 'forest',
            'bg-white dark:bg-[#211A2D] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] text-[#251B32] dark:text-[#FFF8F0] border border-[#E7D5C1] dark:border-[#493B55] shadow-sm':
              variant === 'secondary',
            'text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-[#FFF8F0] hover:bg-[#F3EBDD] dark:hover:bg-[#292137]':
              variant === 'subtle',
            'bg-transparent border border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:text-[#251B32] dark:hover:text-[#FFF8F0]':
              variant === 'outline',
            'bg-[#DC2626] dark:bg-[#EF4444] hover:bg-rose-700 text-white shadow-sm':
              variant === 'destructive',
          },
          className
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export default Button;
