import { type ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/cn';

export interface DraggableCardProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** When true, the card is not draggable (e.g. user lacks the move permission). */
  disabled?: boolean;
}

/** Wraps content as a draggable item. Visual lift while dragging. */
export function DraggableCard({ id, children, className, disabled }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        !disabled && 'cursor-grab touch-none active:cursor-grabbing',
        'transition-shadow',
        isDragging && 'z-10 opacity-80 shadow-elevated',
        className,
      )}
      {...(disabled ? {} : listeners)}
      {...attributes}
    >
      {children}
    </div>
  );
}
