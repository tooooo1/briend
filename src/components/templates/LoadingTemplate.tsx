import Logo from '@/svgs/logo.svg';
import { cn } from '@/utils/cn';
import { Spinner } from '@radix-ui/themes';

interface LoadingTemplateProps {
  className?: string;
}

export const LoadingTemplate = ({ className }: LoadingTemplateProps) => {
  return (
    <div
      className={cn(
        'z-50 size-full flex-1 flex-col gap-4 bg-slate-50 flex-center',
        className,
      )}
    >
      <Logo className="w-24 text-slate-900" />
      <Spinner className="text-slate-900" size="3" />
    </div>
  );
};
