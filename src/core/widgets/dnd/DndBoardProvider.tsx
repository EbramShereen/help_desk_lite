import { type ReactNode } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';

export interface DndBoardProviderProps {
  children: ReactNode;
  /** Called on drop. `activeId` is the dragged item, `overId` the drop target (column/zone). */
  onDrop: (activeId: string, overId: string | null) => void;
  onDragStart?: (activeId: string) => void;
}

/**
 * Thin dnd-kit wrapper for board/backlog drag interactions. A small activation
 * distance prevents accidental drags from blocking clicks, keeping the React
 * render cycle responsive (persisting happens via mutations in the view).
 */
export function DndBoardProvider({ children, onDrop, onDragStart }: DndBoardProviderProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleStart = (e: DragStartEvent) => onDragStart?.(String(e.active.id));
  const handleEnd = (e: DragEndEvent) =>
    onDrop(String(e.active.id), e.over ? String(e.over.id) : null);

  return (
    <DndContext sensors={sensors} onDragStart={handleStart} onDragEnd={handleEnd}>
      {children}
    </DndContext>
  );
}
