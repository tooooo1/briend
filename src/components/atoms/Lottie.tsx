'use client';

import type { LottieComponentProps as OriginalLottieProps } from 'lottie-react';

import dynamic from 'next/dynamic';

import { memo } from 'react';

import { cn } from '@/utils';

export interface LottieProps extends OriginalLottieProps {
  innerClassName?: string;
}

const OriginalLottie = dynamic(() => import('lottie-react'), {
  ssr: false,
});

export const Lottie = memo(
  ({
    loop = false,
    className,
    innerClassName,
    style,
    ...props
  }: LottieProps) => (
    <div className={className} style={style}>
      <OriginalLottie
        {...props}
        className={cn('size-full', innerClassName)}
        loop={loop}
      />
    </div>
  ),
);

Lottie.displayName = 'Lottie';
