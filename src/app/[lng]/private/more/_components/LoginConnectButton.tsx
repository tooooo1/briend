'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';

import { useTranslation } from '@/app/i18n/client';
import type { SessionDataToUpdate } from '@/auth';
import { LOGIN_PROVIDERS } from '@/constants';
import { API_ROUTES } from '@/routes/api';
import { customCookies, cn } from '@/utils';
import { toast } from '@/utils/client';
import { Badge, Skeleton, Spinner } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';

interface LoginConnectButtonProps {
  provider: LOGIN_PROVIDERS;
}

export const LoginConnectButton = ({ provider }: LoginConnectButtonProps) => {
  const session = useSession();

  const user = session.data?.user;
  const { t } = useTranslation('more');
  const isConnected =
    user?.[
      {
        [LOGIN_PROVIDERS.GOOGLE]: 'isGoogleConnected' as const,
        [LOGIN_PROVIDERS.KAKAO]: 'isKakaoConnected' as const,
        [LOGIN_PROVIDERS.NAVER]: 'isNaverConnected' as const,
      }[provider]
    ];

  const unlinkAccountMutation = useMutation({
    mutationFn: API_ROUTES.UNLINK_ACCOUNT,
    onSuccess: async ({ unlinkedProvider }) => {
      await session.update({
        unlinkedProvider,
      } satisfies SessionDataToUpdate);

      toast({
        message: t(`unlink-${unlinkedProvider}`),
      });
    },
  });

  const isLoading = !user || unlinkAccountMutation.isPending;

  return (
    <button
      className="flex-col gap-2 flex-center"
      disabled={isLoading}
      type={isConnected ? 'button' : 'submit'}
      onClick={async () => {
        if (isConnected) return unlinkAccountMutation.mutate({ provider });

        customCookies.set('PROVIDER_TO_CONNECT', provider);
      }}
    >
      <div
        className={cn(
          'size-14 flex-center rounded-full',
          {
            [LOGIN_PROVIDERS.GOOGLE]:
              'bg-white text-slate-850 border-slate-200 border',
            [LOGIN_PROVIDERS.KAKAO]: 'bg-kakao-yellow text-slate-850',
            [LOGIN_PROVIDERS.NAVER]: 'bg-naver-green',
          }[provider],
        )}
      >
        {unlinkAccountMutation.isPending ? (
          <Spinner />
        ) : (
          <Image
            alt={`${provider}-login`}
            height={28}
            src={`/assets/login/${provider}.png`}
            width={28}
          />
        )}
      </div>
      <Skeleton loading={isLoading}>
        <Badge color={isConnected ? 'gray' : 'blue'}>
          {isConnected ? t('connected-account') : t('need-connect-account')}
        </Badge>
      </Skeleton>
    </button>
  );
};
