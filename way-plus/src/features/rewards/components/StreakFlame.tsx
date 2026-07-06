import React from 'react';
import { cn } from '@/shared/lib/utils';
import { T, Emoji } from '@/shared/components/TypographyScale';

interface StreakFlameProps {
  days: number;
  isActive?: boolean;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  days,
  isActive = true
}) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
      isActive 
        ? "bg-amber-50 border-amber-200" 
        : "bg-slate-100 border-slate-200"
    )}>
      <Emoji className={isActive ? "" : "grayscale opacity-50"}>🔥</Emoji>
      <T size="xs" bold color={isActive ? "warning" : "muted"}>
        {days}
      </T>
      <T size="micro" color="muted">
        {days === 1 ? 'día' : 'días'}
      </T>
    </div>
  );
};
