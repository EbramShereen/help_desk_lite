import { type ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../lib/cn';

export interface DroppableColumnProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/** A drop zone (board column / sprint / backlog) that highlights when hovered. */
export function DroppableColumn({ id, children, className }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn('rounded-card transition-colors', isOver && 'ring-2 ring-accent/60', className)}
    >
      {children}
    </div>
  );
}
