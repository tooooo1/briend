import { NextResponse, type NextRequest } from 'next/server';

import { COOKIES } from '@/constants/cookies';
import { prisma } from '@/prisma';
import type { ApiParams } from '@/types/api-params';
import type { ApiResponse } from '@/types/api-response';
import { createApiRoute } from '@/utils/api/createApiRoute';
import { CustomError, ERROR } from '@/utils/customError';

export const POST = createApiRoute(
  async (req: NextRequest) => {
    const params: ApiParams.EDIT_PROFILE = await req.json();

    const id = req.cookies.get(COOKIES.USER_ID)?.value;

    if (!id) throw new CustomError(ERROR.NOT_ENOUGH_PARAMS(['id']));

    const user = await prisma.users.update({
      where: {
        id,
      },
      data: {
        emoji: params.emoji,
        name: params.nickname,
      },
    });

    if (!user.name)
      throw new CustomError(ERROR.NOT_ENOUGH_PARAMS(['user.name']));

    return NextResponse.json<ApiResponse.EDIT_PROFILE>({
      emoji: user.emoji,
      nickname: user.name,
    });
  },
  {
    auth: true,
  },
);
