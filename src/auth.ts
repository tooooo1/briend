import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { COOKIES } from './constants/cookies-key';
import { SECRET_ENV } from './constants/secret-env';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn: async ({ user: { id, email, image, name } }) => {
      const cookieStore = cookies();

      if (!id || !email || !image || !name) throw new Error('Invalid user');

      const accessToken = await new SignJWT({ id, email, image, name })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2d')
        .sign(new TextEncoder().encode(SECRET_ENV.AUTH_SECRET));

      cookieStore.set(COOKIES.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 172_800, // 2d
      });

      return true;
    },
  },
});