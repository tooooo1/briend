import type {
  AppRouterInstance,
  NavigateOptions,
  PrefetchOptions,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/shallow';

import { SESSION_STORAGE } from '@/constants';
import { ROUTES } from '@/routes/client';
import {
  useGlobalStore,
  useGlobalModalStore,
  useHistoryStore,
  type NAVIGATION_ANIMATION,
} from '@/stores';
import { isCurrentHref } from '@/utils';

import { useCustomHref } from './useCustomHref';

interface CustomNavigationOptions {
  withLoading?: boolean;
  withAnimation?: NAVIGATION_ANIMATION;
  toSidePanel?: boolean;
}

interface CustomRouter extends AppRouterInstance {
  push: (
    href: string | URL,
    options?: NavigateOptions & CustomNavigationOptions,
  ) => void;
  replace: (
    href: string | URL,
    options?: NavigateOptions & CustomNavigationOptions,
  ) => void;
  prefetch: (href: string | URL, options?: PrefetchOptions) => void;
  back: (options?: Omit<CustomNavigationOptions, 'toSidePanel'>) => void;
  forward: (options?: Omit<CustomNavigationOptions, 'toSidePanel'>) => void;
}

let memoizedCustomRouter: CustomRouter;

export const useCustomRouter = () => {
  const router = useRouter();
  const getCustomHref = useCustomHref();
  const [setGlobalLoading, setSidePanelUrl, setNavigationAnimation] =
    useGlobalStore(
      useShallow((state) => [
        state.setGlobalLoading,
        state.setSidePanelUrl,
        state.setNavigationAnimation,
      ]),
    );

  if (memoizedCustomRouter) return memoizedCustomRouter;

  const replace: CustomRouter['replace'] = (href, options) => {
    const customHref = getCustomHref(href);

    if (isCurrentHref(customHref)) return;

    const {
      withLoading,
      withAnimation = 'NONE',
      scroll,
      toSidePanel,
    } = options ?? {};

    if (toSidePanel) return setSidePanelUrl(customHref);

    sessionStorage.setItem(SESSION_STORAGE.REPLACE_MARK, 'true');

    if (withLoading) setGlobalLoading(true);

    setNavigationAnimation(withAnimation);

    return router.replace(customHref, {
      scroll,
    });
  };

  memoizedCustomRouter = {
    forward: (options) => {
      const { withLoading, withAnimation = 'FROM_BOTTOM' } = options ?? {};

      if (withLoading) setGlobalLoading(true);

      setNavigationAnimation(withAnimation);

      return router.forward();
    },
    refresh: router.refresh,
    back: (options) => {
      const { setIsGlobalModalOpen, backNoticeInfo } =
        useGlobalModalStore.getState();

      if (backNoticeInfo) return setIsGlobalModalOpen(true);

      const { withLoading, withAnimation = 'FROM_TOP' } = options ?? {};

      const { historyIndex } = useHistoryStore.getState();

      const hasBack = 0 < historyIndex;

      if (!hasBack)
        return replace(ROUTES.FRIEND_LIST.pathname, {
          withAnimation,
          withLoading,
        });

      if (withLoading) setGlobalLoading(true);

      setNavigationAnimation(withAnimation);

      return router.back();
    },
    push: (href, options) => {
      const customHref = getCustomHref(href);

      if (isCurrentHref(customHref)) return;

      const {
        scroll,
        toSidePanel,
        withAnimation = 'FROM_BOTTOM',
        withLoading,
      } = options ?? {};

      if (toSidePanel) return setSidePanelUrl(customHref);

      if (withLoading) setGlobalLoading(true);

      setNavigationAnimation(withAnimation);

      return router.push(customHref, {
        scroll,
      });
    },
    replace,
    prefetch: (href, options) => {
      const customHref = getCustomHref(href);

      if (isCurrentHref(customHref)) return;

      return router.prefetch(customHref, options);
    },
  };

  return memoizedCustomRouter;
};
