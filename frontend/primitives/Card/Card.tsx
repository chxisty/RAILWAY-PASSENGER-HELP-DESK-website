import React, { ComponentProps } from 'react';
import clsx from 'clsx';

export interface CardProps extends ComponentProps<'div'> {
  variant?: 'default' | 'elevated' | 'subtle';
  interactive?: boolean;
}

export function Card({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl transition-all duration-300 border card-module',
        {
          'bg-white dark:bg-[#211A2D] border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] shadow-sm dark:shadow-md': variant === 'default',
          'bg-[#FFFDF9] dark:bg-[#292137] border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] shadow-md dark:shadow-lg': variant === 'elevated',
          'bg-[#F3EBDD] dark:bg-[#191426] border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD]': variant === 'subtle',
          'hover:bg-[#FFFDF9] dark:hover:bg-[#292137] hover:border-[#E9793D] dark:hover:border-[#F18445] hover:shadow-md hover:-translate-y-1 cursor-pointer transform': interactive,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
