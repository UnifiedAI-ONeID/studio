import { cn } from '@/lib/utils';

const AvidityLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn('h-8 w-8', className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Avidity Logo"
    >
      <path
        d="M50 15L85 85H15L50 15Z"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="8" />
      <path
        d="M50 20V50"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AvidityLogo;
