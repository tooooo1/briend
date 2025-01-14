'use client';

import { SessionProvider } from 'next-auth/react';

import type { PropsWithChildren } from 'react';
import { CookiesProvider } from 'react-cookie';

import { DEFAULT_COOKIES_OPTIONS, IS_CLIENT, QUERY_KEYS } from '@/constants';
import { customCookies } from '@/utils';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { OmitKeyof } from '@tanstack/react-query';
import { MutationCache, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { FriendStoreMounter } from './FriendStoreMounter';
import { GlobalEventListener } from './GlobalEventListener';
import { HistoryObserver } from './HistoryObserver';
import { PeerConnector } from './PeerConnector';

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const { invalidatesIfHasAll, resetsIfHasAll } = mutation.meta ?? {};

      if (invalidatesIfHasAll)
        queryClient.invalidateQueries({
          predicate: (query) =>
            invalidatesIfHasAll.some((invalidate) =>
              invalidate.every((key) => query.queryKey.includes(key)),
            ),
        });

      if (resetsIfHasAll)
        queryClient.invalidateQueries({
          predicate: (query) =>
            resetsIfHasAll.some((reset) =>
              reset.every((key) => query.queryKey.includes(key)),
            ),
        });
    },
  }),
  defaultOptions: {
    queries: {
      gcTime: 360_000,
    },
  },
});

const persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'> = {
  persister: createSyncStoragePersister({
    storage: IS_CLIENT ? window.sessionStorage : null,
  }),
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.queryKey.includes(QUERY_KEYS.SESSION),
  },
};

export const GlobalProvider = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      <CookiesProvider
        cookies={customCookies}
        defaultSetOptions={DEFAULT_COOKIES_OPTIONS}
      >
        <HistoryObserver />
        <GlobalEventListener />
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <ReactQueryDevtools initialIsOpen={false} />
          <FriendStoreMounter />
          <PeerConnector />
          {children}
        </PersistQueryClientProvider>
      </CookiesProvider>
    </SessionProvider>
  );
};
