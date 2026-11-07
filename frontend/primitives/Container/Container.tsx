import React, { ComponentProps } from 'react';
import clsx from 'clsx';

interface ContainerProps extends ComponentProps<'div'> {
  size?: 'small' | 'medium' | 'large' | 'full';
}

export function Container({
  size = 'large',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={clsx(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        {
          'max-w-4xl': size === 'small',
          'max-w-5xl': size === 'medium',
          'max-w-7xl': size === 'large',
          'max-w-none': size === 'full',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Container;

