import React, { ComponentProps, ReactNode, forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends ComponentProps<'input'> {
  iconPrefix?: ReactNode;
  iconSuffix?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ iconPrefix, iconSuffix, error, className, wrapperClassName, ...props }, ref) => {
    return (
      <div className={clsx('relative flex flex-col gap-1 w-full', wrapperClassName)}>
        <div className="relative flex items-center w-full">
          {iconPrefix && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
              {iconPrefix}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full bg-[#FAF5ED] dark:bg-[#191426] text-[#251B32] dark:text-[#FFF8F0] placeholder:text-[#7B6F80] dark:placeholder:text-[#8E8098] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:border-[#E9793D] dark:focus:border-[#F18445] focus:ring-2 focus:ring-[var(--ring)]/30 disabled:opacity-50 disabled:cursor-not-allowed',
              {
                'pl-9': Boolean(iconPrefix),
                'pr-9': Boolean(iconSuffix),
                'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20': Boolean(error),
              },
              className
            )}
            {...props}
          />
          {iconSuffix && (
            <div className="absolute right-3 flex items-center text-[#685C6B] dark:text-[#C5B9CD]">
              {iconSuffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 px-0.5 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
