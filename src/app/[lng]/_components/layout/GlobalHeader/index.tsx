import { VscBell } from 'react-icons/vsc';

import Logo from '@/assets/logo.svg';
import { IconButton } from '@radix-ui/themes';

export const GlobalHeader = () => {
  return (
    <nav className="flex h-14 items-center justify-between px-5">
      <Logo className="h-7 text-yellow-500" />
      <IconButton className="rounded-full" color="yellow" variant="ghost">
        <VscBell className="size-7" />
      </IconButton>
    </nav>
  );
};
