'use client';

import Link, { type LinkProps } from 'next/link';
import { useShallow } from 'zustand/shallow';

import { useEffect, useState } from 'react';

import { SESSION_STORAGE } from '@/constants';
import { useCustomHref } from '@/hooks';
import { useGlobalStore, type NAVIGATION_ANIMATION } from '@/stores';
import { isCurrentHref } from '@/utils';

export interface CustomLinkProps extends LinkProps {
  children?: React.ReactNode;
  className?: string;
  i18nOptimize?: boolean;
  withLoading?: boolean;
  withAnimation?: NAVIGATION_ANIMATION;
  toSidePanel?: boolean;
}

export const CustomLink = ({
  children,
  href,
  onClick,
  i18nOptimize = true,
  replace,
  withLoading = false,
  withAnimation,
  toSidePanel,
  ...restLinkProps
}: CustomLinkProps) => {
  const getCustomHref = useCustomHref();

  const stringHref = href.toString();

  const [customHref, setCustomHref] = useState(stringHref);

  const [setGlobalLoading, setSidePanelUrl, setNavigationAnimation] =
    useGlobalStore(
      useShallow((state) => [
        state.setGlobalLoading,
        state.setSidePanelUrl,
        state.setNavigationAnimation,
      ]),
    );

  useEffect(() => {
    if (!i18nOptimize) return;

    const customHref = getCustomHref(stringHref);

    setCustomHref(customHref);
  }, [getCustomHref, i18nOptimize, stringHref]);

  return (
    <Link
      {...restLinkProps}
      shallow
      href={customHref}
      replace={replace}
      onClick={(e) => {
        try {
          if (toSidePanel) {
            e.preventDefault();
            setSidePanelUrl(customHref);

            return;
          }

          if (isCurrentHref(customHref)) {
            console.info('blocked by same href');

            return e.preventDefault();
          }

          if (withLoading) setGlobalLoading(true);

          setNavigationAnimation(withAnimation || 'NONE');

          if (replace)
            sessionStorage.setItem(SESSION_STORAGE.REPLACE_MARK, 'true');
        } finally {
          onClick?.(e);
        }
      }}
    >
      {children}
    </Link>
  );
};
