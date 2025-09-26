import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 shadow-md backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}