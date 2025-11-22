import { LogoPlaceholder } from '@/components/ui/placeholders';
import { cn } from '@/lib/utils';

const AvidityLogo = ({ className }: { className?: string }) => {
  return <LogoPlaceholder className={cn(className)} />;
};

export default AvidityLogo;
