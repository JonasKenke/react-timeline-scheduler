import React from 'react';
import type { BaseScheduleItem } from '../types';
import type { Translations } from '../lib/translations';

export interface ItemCardProps<T extends BaseScheduleItem = BaseScheduleItem> {
  item: T;
  leftPercent: string;
  widthPercent: string;
  top: string;
  showTimeLabel: boolean;
  isAllDayItem: boolean;
  colorClass: string;
  compact: boolean;
  t: Translations;
  canEdit: boolean;
  onItemClick: (item: T) => void;
  onDragStart: (e: React.DragEvent, item: T) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

/**
 * Renders a single positioned item card within the timeline view.
 * Pure presentational — receives all computed positioning values as props.
 */
export function ItemCard<T extends BaseScheduleItem>({
  item,
  leftPercent,
  widthPercent,
  top,
  showTimeLabel,
  isAllDayItem,
  colorClass,
  compact,
  t,
  canEdit,
  onItemClick,
  onDragStart,
  onDragEnd,
}: ItemCardProps<T>) {
  return (
    <div
      className={`absolute rounded px-2 py-1 text-white text-xs cursor-move hover:opacity-80 transition-opacity ${
        colorClass
      } ${compact ? 'text-[10px] px-1 py-0.5' : ''}`}
      style={{
        left: leftPercent,
        width: widthPercent,
        top,
      }}
      title={
        isAllDayItem
          ? `${item.title} (${t.allDay})`
          : `${item.title} (${item.startTime}-${item.endTime})`
      }
      onClick={() => onItemClick(item)}
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
    >
      <div className="font-semibold truncate">{item.title}</div>
      {isAllDayItem ? (
        <div className="text-xs opacity-90">{t.allDay}</div>
      ) : (
        showTimeLabel && (
          <div className="text-xs opacity-90">
            {item.startTime}-{item.endTime}
          </div>
        )
      )}
    </div>
  );
}
