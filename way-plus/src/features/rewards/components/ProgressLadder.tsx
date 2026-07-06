import React from 'react';
import { cn } from '@/shared/lib/utils';
import { T, Emoji } from '@/shared/components/TypographyScale';

interface ProgressLadderProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressLadder: React.FC<ProgressLadderProps> = ({
  current,
  total,
  label = 'progreso'
}) => {
  const steps = Array.from({ length: total }, (_, i) => i < current);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <T size="xs" bold color="muted">
          {label}
        </T>
        <T size="xs" bold color="primary">
          {current}/{total}
        </T>
      </div>
      
      <div className="flex gap-1.5">
        {steps.map((isCompleted, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-2 rounded-full transition-all duration-300",
              isCompleted ? "bg-violet-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
};
