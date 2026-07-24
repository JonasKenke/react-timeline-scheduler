import React from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

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

interface CalendarDayProps {
  day: Date;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  isWeekend?: boolean;
  items: CalendarItem[];
  maxVisibleItems?: number;
  showAddButton?: boolean;
  canCreate?: boolean;
  draggable?: boolean;
  locale?: string;
  t: Record<string, string>;
  itemTypes: Record<string, { label: string; color: string }>;
  onItemClick?: (item: CalendarItem) => void;
  onAddClick?: (day: Date) => void;
  onDoubleClick?: (day: Date) => void;
  onDragStart?: (e: React.DragEvent, item: CalendarItem) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, day: Date) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, day: Date) => void;
  isDropTarget?: boolean;
  variant?: 'month' | 'week';
}

/**
 * A single day cell in calendar view (month grid or week grid).
 * Shows compact item previews with optional add button.
 */
export function CalendarDay({
  day,
  isCurrentMonth = true,
  isToday = false,
  isWeekend = false,
  items,
  maxVisibleItems = 3,
  showAddButton = false,
  canCreate = false,
  draggable = true,
  locale: localeProp = 'en',
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
  isDropTarget = false,
  variant = 'month',
}: CalendarDayProps) {
  return (
    <div
      className={`min-h-20 sm:min-h-[120px] p-1 sm:p-2 border-r border-b last:border-r-0 group relative cursor-pointer hover:bg-muted/20 transition-colors ${
        !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
      } ${isToday ? 'bg-primary/10' : ''} ${
        isWeekend ? 'bg-muted/10' : ''
      } ${isDropTarget ? 'bg-primary/20' : ''}`}
      onDoubleClick={() => onDoubleClick?.(day)}
      onDragOver={(e) => onDragOver?.(e, day)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop?.(e, day)}
    >
      <div
        className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
          isToday ? 'text-primary' : ''
        }`}
      >
        {format(day, 'd')}
      </div>

      <div className="space-y-1">
        {items.slice(0, maxVisibleItems).map((item) => (
          <div
            key={item.id}
            className={`text-xs p-1 rounded text-white cursor-move hover:opacity-80 transition-opacity ${
              item.color ||
              itemTypes[item.type || 'default']?.color ||
              'bg-blue-500'
            }`}
            onClick={() => onItemClick?.(item)}
            draggable={draggable}
            onDragStart={(e) => onDragStart?.(e, item)}
            onDragEnd={onDragEnd}
          >
            <div className="truncate font-semibold">{item.group.name}</div>
            <div className="truncate">{item.title}</div>
            {variant === 'week' && (
              <div className="text-xs opacity-90">
                {item.startTime}-{item.endTime}
              </div>
            )}
          </div>
        ))}

        {items.length > maxVisibleItems && (
          <div className="text-xs text-muted-foreground text-center">
            +{items.length - maxVisibleItems} {t.moreItems}
          </div>
        )}
      </div>

      {showAddButton && canCreate && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs"
          onClick={() => onAddClick?.(day)}
        >
          +
        </Button>
      )}
    </div>
  );
}
