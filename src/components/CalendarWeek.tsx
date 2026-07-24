import { CalendarDay } from './CalendarDay';

type CalendarItem = {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  type?: string;
  color?: string;
  notes?: string;
  group: { name: string };
  [key: string]: any;
};

interface CalendarWeekRowProps {
  weekDays: Date[];
  currentDate: Date;
  isToday: (date: Date) => boolean;
  getItemsForDay: (date: Date) => CalendarItem[];
  isDropTargetForDay: (date: Date) => boolean;
  maxVisibleItems?: number;
  canCreate?: boolean;
  draggable?: boolean;
  locale?: string;
  t: Record<string, string>;
  itemTypes: Record<string, { label: string; color: string }>;
  onItemClick: (item: CalendarItem) => void;
  onAddClick: (day: Date) => void;
  onDoubleClick: (day: Date) => void;
  onDragStart: (e: React.DragEvent, item: CalendarItem) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, day: Date) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, day: Date) => void;
  variant?: 'month' | 'week';
}

/**
 * A row of 7 day cells (one calendar week).
 */
export function CalendarWeekRow({
  weekDays,
  currentDate,
  isToday,
  getItemsForDay,
  isDropTargetForDay,
  maxVisibleItems = 3,
  canCreate = false,
  draggable = true,
  locale,
  t,
  itemTypes,
  onItemClick,
  onAddClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  variant = 'month',
}: CalendarWeekRowProps) {
  return (
    <>
      {weekDays.map((day, index) => {
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        const today = isToday(day);
        const isWeekend = index % 7 === 5 || index % 7 === 6;
        const isDropTarget = isDropTargetForDay(day);

        return (
          <CalendarDay
            key={index}
            day={day}
            isCurrentMonth={isCurrentMonth}
            isToday={today}
            isWeekend={isWeekend}
            items={getItemsForDay(day)}
            maxVisibleItems={maxVisibleItems}
            showAddButton={canCreate}
            canCreate={canCreate}
            draggable={draggable}
            locale={locale}
            t={t}
            itemTypes={itemTypes}
            onItemClick={onItemClick}
            onAddClick={onAddClick}
            onDoubleClick={onDoubleClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            isDropTarget={isDropTarget}
            variant={variant}
          />
        );
      })}
    </>
  );
}
