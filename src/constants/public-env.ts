const publicEnv = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
};

for (const key in publicEnv) {
  const _key = key as keyof typeof publicEnv;
  if (!publicEnv[_key]) {
    throw new Error(`${key} is not set`);
  }
}

export const PUBLIC_ENV = publicEnv as Record<keyof typeof publicEnv, string>;