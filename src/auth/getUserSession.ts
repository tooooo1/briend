import type { LANGUAGE } from '@/constants';
import type { LOGIN_PROVIDERS } from '@/constants/etc';
import { firestore } from '@/database/firestore/server';
import { COLLECTIONS, type Firestore } from '@/database/firestore/type';
import type { UserSession } from '@/types/next-auth';
import { createId } from '@/utils/createId';
import { getFirebaseAdminAuth } from '@/utils/server';

interface GetUserSessionProps {
  provider: LOGIN_PROVIDERS;
  providerId: string;
  userId: string;
  name: string;
  email?: string;
  profileImage?: string;
  language: LANGUAGE;
}

export const getUserSession = async (props: GetUserSessionProps) => {
  const providerAccountRef = await firestore((db) =>
    db
      .collection(COLLECTIONS.PROVIDER_ACCOUNTS)
      .doc(`${props.provider}-${props.providerId}`),
  );

  const providerAccount = await providerAccountRef.get();

  const idKey = `${props.provider}Id` as const;

  let id = props.userId;

  const userSession: UserSession = {
    id,
    name: props.name,
    profileImage: props.profileImage,
    language: props.language,
    email: props.email,
    [idKey]: props.providerId,
  };

  const auth = await getFirebaseAdminAuth();

  const usersRef = await firestore((db) => db.collection(COLLECTIONS.USERS));

  if (providerAccount.exists) {
    const { userId } = providerAccount.data() as Firestore.ProviderAccount;

    const user = await usersRef.doc(userId).get();

    const userData = user.data() as Firestore.UserInfo;

    return {
      ...userSession,
      ...userData,
    };
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    //* 존재 하지 않는 id를 생성할 때 까지 반복
    try {
      await auth.getUser(id);

      id = createId();
    } catch {
      break;
    }
  }

  userSession.id = id;

  await Promise.all([
    auth.createUser({
      displayName: props.name,
      email: props.email,
      photoURL: props.profileImage,
      uid: id,
    }),
    providerAccountRef.set({ userId: id }),
    usersRef.doc(id).set({
      language: props.language,
      [idKey]: props.providerId,
    } satisfies Firestore.UserInfo),
  ]);

  return userSession;
};
