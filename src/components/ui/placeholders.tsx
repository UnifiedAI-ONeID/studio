import { cn } from '@/lib/utils';
import { Building, Calendar, ImageIcon, User } from 'lucide-react';

export const LogoPlaceholder = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn('h-8 w-8', className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Avidity Logo Placeholder"
    >
      <path
        d="M50 10C35 10 15 30 15 50C15 70 50 90 50 90C50 90 85 70 85 50C85 30 65 10 50 10Z"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M35 55L50 25L65 55"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 45H58"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ImagePlaceholder = ({ className }: { className?: string }) => (
    <ImageIcon className={cn('h-8 w-8', className)} />
);

export const AvatarPlaceholder = ({ className }: { className?: string }) => (
    <User className={cn('h-8 w-8', className)} />
);

export const EventPlaceholder = ({ className }: { className?: string }) => (
    <Calendar className={cn('h-8 w-8', className)} />
);

export const VenuePlaceholder = ({ className }: { className?: string }) => (
    <Building className={cn('h-8 w-8', className)} />
);
