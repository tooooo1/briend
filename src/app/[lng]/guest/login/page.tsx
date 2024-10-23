import { getTranslation } from '@/app/i18n/server';
import { LOGIN_PROVIDERS } from '@/constants/etc';
import type { LANGUAGE } from '@/constants/language';
import Logo from '@/svgs/logo.svg';

import { LoginButton } from './_components/LoginButton';

interface LoginPageProps {
  params: Promise<{
    lng: LANGUAGE;
  }>;
}

const LoginPage = async (props: LoginPageProps) => {
  const params = await props.params;

  const { lng } = params;

  const { t } = await getTranslation('login', lng);

  return (
    <article className="flex flex-1 flex-col justify-between px-4 py-8">
      <header className="flex flex-1 flex-col items-center justify-center gap-2">
        <Logo className="w-40" />
        <h1 className="ml-2 text-lg font-semibold">{t('title')}</h1>
      </header>
      <section>
        <LoginButton fullSize lng={lng} provider={LOGIN_PROVIDERS.GOOGLE} />
      </section>
      <div className="m-4 gap-2 text-slate-350 flex-center">
        <hr className="flex-1 border-slate-350" />
        또는
        <hr className="flex-1 border-slate-350" />
      </div>
      <section className="gap-4 flex-center">
        <LoginButton lng={lng} provider={LOGIN_PROVIDERS.KAKAO} />
        <LoginButton lng={lng} provider={LOGIN_PROVIDERS.NAVER} />
      </section>
    </article>
  );
};

export default LoginPage;
