'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Badge } from '@/primitives/Badge';

export interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  showBadge?: boolean;
  size?: 'small' | 'medium' | 'large';
  emblemOnly?: boolean;
}

export function Logo({
  className,
  showSubtitle = true,
  showBadge = true,
  size = 'medium',
  emblemOnly = false,
}: LogoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const imageDimension = size === 'small' ? 30 : size === 'medium' ? 36 : 44;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  return (
    <Link
      href="/"
      target="_self"
      onClick={handleClick}
      className={clsx(
        'flex items-center gap-2.5 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E48] rounded select-none min-w-max cursor-pointer',
        className
      )}
      title="RailAssist AI – Railway Passenger Help Desk"
    >
      <div
        className={clsx(
          'relative rounded-full overflow-hidden shrink-0 border border-[#E5D5C4] dark:border-[#493B50] bg-[#FAF5ED] dark:bg-[#171322] shadow-sm',
          {
            'w-7 h-7': size === 'small',
            'w-9 h-9': size === 'medium',
            'w-11 h-11': size === 'large',
          }
        )}
      >
        <Image
          src="/railassist-logo.png"
          alt="RailAssist AI Logo"
          width={imageDimension}
          height={imageDimension}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {!emblemOnly && (
        <div className="flex flex-col justify-center min-w-max">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'brand-title font-extrabold tracking-tight transition-colors whitespace-nowrap',
                {
                  'text-sm': size === 'small',
                  'text-[15px]': size === 'medium',
                  'text-lg': size === 'large',
                }
              )}
            >
              RailAssist AI
            </span>
            {showBadge && (
              <Badge variant="verified" size="small" className="hidden lg:inline-flex py-0 px-1.5 text-[9px] font-bold">
                RAG VERIFIED
              </Badge>
            )}
          </div>
          {showSubtitle && (
            <span
              className={clsx(
                'brand-subtitle font-medium transition-colors whitespace-nowrap',
                {
                  'text-[10px]': size === 'small',
                  'text-[11px]': size === 'medium',
                  'text-xs': size === 'large',
                }
              )}
            >
              Railway Passenger Help Desk
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export default Logo;
