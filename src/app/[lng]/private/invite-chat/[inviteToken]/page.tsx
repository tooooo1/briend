'use client';

import { setCookie } from 'cookies-next';
import { decodeJwt } from 'jose';

import { useEffect } from 'react';

import { useTranslation } from '@/app/i18n/client';
import { pusher } from '@/app/pusher/client';
import { CustomBottomNav } from '@/components/CustomBottomNav';
import { Timer } from '@/components/Timer';
import { CHANNEL } from '@/constants/channel';
import { COOKIES } from '@/constants/cookies-key';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { ROUTES } from '@/routes/client';
import type { PusherType } from '@/types/api';
import type { Payload } from '@/types/jwt';
import { toast } from '@/utils/toast';

import { InviteQRSection } from './_components/InviteQRSection';

interface InviteChatQRPageProps {
  params: {
    inviteToken: string;
  };
}

const InviteChatQRPage = ({
  params: { inviteToken },
}: InviteChatQRPageProps) => {
  const payload = decodeJwt<Payload.InviteToken>(inviteToken);
  const hostId = payload.hostId;

  const expires = new Date((payload.exp ?? 0) * 1_000);

  const router = useCustomRouter();

  const { t } = useTranslation('invite-chat-qr');

  useEffect(() => {
    const channel = pusher.subscribe(CHANNEL.WAITING);

    const unbindChannel = () => {
      channel.unbind(hostId);
    };

    channel.bind(hostId, ({ channelToken }: PusherType.joinChat) => {
      const { channelId } = decodeJwt<Payload.ChannelToken>(channelToken);

      toast({
        message: t('start-chatting'),
      });

      setCookie(COOKIES.CHANNEL_PREFIX + channelId, channelToken);

      unbindChannel();

      router.replace(
        ROUTES.CHATTING_ROOM.url({
          searchParams: {
            channelId,
          },
        }),
      );
    });

    return unbindChannel;
  }, [hostId, router, t]);

  return (
    <>
      <InviteQRSection inviteToken={inviteToken} language={payload.language} />
      <CustomBottomNav className="flex justify-center">
        <Timer
          expires={expires}
          onTimeout={() => {
            toast({
              message: t('expired-toast-message'),
            });

            router.replace(ROUTES.EXPIRED_CHAT.pathname);
          }}
        />
      </CustomBottomNav>
    </>
  );
};

export default InviteChatQRPage;
