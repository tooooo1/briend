import type { JWTPayload } from 'jose';

import { decodeJwt, errors } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { COOKIES } from '@/constants';
import type { JwtPayload, TOKEN_TYPE } from '@/types/jwt';
import { CustomError, ERROR, ERROR_STATUS } from '@/utils';
import { createApiRoute, jwtSecretVerify } from '@/utils/api';

type ChatTokenPayload = JwtPayload.InviteToken | JwtPayload.ChannelToken;

export interface VerifyChatTokenApiParams<TTokenType extends TOKEN_TYPE> {
  tokenType: TTokenType;
  token: string;
}

export interface VerifyChatTokenApiResponse<TTokenType extends TOKEN_TYPE> {
  isExpired: boolean;
  tokenType: TOKEN_TYPE;
  payload: (TTokenType extends TOKEN_TYPE.INVITE
    ? JwtPayload.InviteToken
    : JwtPayload.ChannelToken) &
    JWTPayload;
}

export const GET = createApiRoute<
  VerifyChatTokenApiResponse<TOKEN_TYPE>,
  {
    tokenType: TOKEN_TYPE;
  }
>(async (req, { params }) => {
  const { searchParams } = req.nextUrl;

  const { tokenType } = await params;

  const token = searchParams.get('token');

  if (!token) throw new CustomError(ERROR.NOT_ENOUGH_PARAMS(['token']));

  try {
    const { payload } = await jwtSecretVerify<ChatTokenPayload>(token);

    const cookiesStore = await cookies();

    const userId = cookiesStore.get(COOKIES.USER_ID)?.value;

    if (![payload.hostId, payload.guestId].includes(userId)) {
      throw new CustomError({
        status: ERROR_STATUS.UNAUTHORIZED,
      });
    }

    return NextResponse.json({
      isExpired: false,
      tokenType,
      payload,
    });
  } catch (e) {
    if (e instanceof errors.JWTExpired) {
      const payload = decodeJwt<ChatTokenPayload>(token);

      return NextResponse.json({
        isExpired: true,
        tokenType,
        payload,
      });
    }

    throw e;
  }
});
