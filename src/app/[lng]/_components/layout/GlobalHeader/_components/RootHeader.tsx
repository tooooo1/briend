'use client';

import { usePathname } from 'next/navigation';

import { useTranslation } from '@/app/i18n/client';
import Logo from '@/assets/logo.svg';
import { ROUTES } from '@/routes/client';
import { findRoute } from '@/utils';

export const RootHeader = () => {
  const { t } = useTranslation('layout');

  const pathname = usePathname();

  const currentRoute = findRoute(pathname);

  let titleKey = '';
  let emoji = '';

  switch (currentRoute) {
    case ROUTES.CHATTING:
      titleKey = 'chat-title';
      emoji = '💬';
      break;
    case ROUTES.INVITE_CHAT:
      titleKey = 'invite-chat-title';
      emoji = '📨';
      break;
    default:
      titleKey = 'more-title';
      emoji = '📦';
      break;
  }

  return (
    <nav className="flex h-14 items-center justify-between bg-white px-5">
      <Logo className="h-7 text-gray-600" />
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-700">{t(titleKey)}</h1>
        <span className="text-2xl">{emoji}</span>
      </div>
    </nav>
  );
};
