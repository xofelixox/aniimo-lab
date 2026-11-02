import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVerificationStatus(status: string) {
  switch (status) {
    case 'verified_in_game': return 'Verified in Game';
    case 'theorycrafted': return 'Theorycrafted';
    case 'needs_testing': return 'Needs Testing';
    case 'outdated': return 'Outdated';
    default: return status;
  }
}