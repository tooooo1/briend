import { useEffect, useState } from 'react';

import { CustomError, type CustomErrorProps } from '@/utils/customError';

export const useAsyncError = () => {
  const [error, setError] = useState<CustomErrorProps>();

  useEffect(() => () => setError(undefined), []);

  if (error) throw new CustomError(error);

  return setError;
};
