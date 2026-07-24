import React from 'react';
import { isSameDay } from 'date-fns';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { ItemCard } from './ItemCard';
import type { BaseGroup, BaseScheduleItem } from '../types';
import type { Translations } from '../lib/translations';
import { calculateItemPosition } from '../lib/scheduleHelpers';

/**
 * Computes time string and target date from a mouse position within the timeline.
 */
function mousePositionToTime(
  e: React.DragEvent<HTMLDivElement>,
  dateRange: Date[],
  currentDate: Date
): { time: string; targetDate: Date } {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const totalWidth = rect.width;
  const percentage = x / totalWidth;
  const totalMinutes = dateRange.length * 24 * 60;
  const minutes = Math.floor(percentage * totalMinutes);
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = (minutes % (24 * 60)) % 60;
  const time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  const dayIndex = Math.floor(minutes / (24 * 60));
  const targetDate = dateRange[dayIndex] || currentDate;
  return { time, targetDate };
}

export interface TimelineRowProps<T extends BaseScheduleItem = BaseScheduleItem> {
  group: BaseGroup;
  groups: BaseGroup[];
  employeeItems: T[];
  verticalLevels: number[];
  dateRange: Date[];
  viewMode: 'day' | 'week' | 'month' | 'year';
  currentDate: Date;
  draggedItem: T | null;
  dropTarget: { groupId: string; date: Date; time?: string } | null;
  itemTypes: Record<string, { label: string; color: string }>;
  t: Translations;
  canEdit: boolean;
  canCreate: boolean;
  showGroupRole: boolean;
  showGroupAvatar: boolean;
  groupColors: string[];
  locale: string;
  onItemClick: (item: T) => void;
  onCreateClick: (groupId?: string, date?: Date) => void;
  onDragStart: (e: React.DragEvent, item: T) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, groupId: string, date: Date, time?: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupId: string, date: Date, time?: string) => void;
  computeDropPos: (targetDate: Date, timeStr?: string, item?: T) => { left: number; width: number };
  snapToInterval: (minutes: number, interval?: number) => number;
  timeToMinutes: (timeString: string) => number;
}

/**
 * Renders a single resource row in the timeline view.
 * Includes the group sidebar with avatar/name/role, the timeline grid,
 * current time indicator, drag-and-drop handlers, drop placeholder, and items.
 */
export function TimelineRow<T extends BaseScheduleItem>({
  group,
  groups,
  employeeItems,
  verticalLevels,
  dateRange,
  viewMode,
  currentDate,
  draggedItem,
  dropTarget,
  itemTypes,
  t,
  canEdit,
  canCreate,
  showGroupRole,
  showGroupAvatar,
  groupColors,
  onItemClick,
  onCreateClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  computeDropPos,
  snapToInterval,
  timeToMinutes,
}: TimelineRowProps<T>) {
  const groupIndex = groups.indexOf(group);

  return (
    <div key={group.id} className="border-t">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `200px repeat(${dateRange.length * 24}, 1fr)`,
        }}
      >
        {/* Group info sidebar */}
        <div className="p-4 border-r bg-background sticky left-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                group.color || groupColors[groupIndex % groupColors.length]
              }`}
            >
              {showGroupAvatar && group.avatar ? (
                <img
                  src={group.avatar}
                  alt={group.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                group.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
              )}
            </div>
            <div>
              <div className="font-semibold">{group.name}</div>
              {showGroupRole && group.role && (
                <div className="text-sm text-muted-foreground">
                  {group.role}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline area */}
        <div
          className={`relative col-span-full border-r bg-background ${
            dropTarget?.groupId === group.id ? 'bg-primary/10' : ''
          }`}
          style={{
            minHeight:
              employeeItems.length > 0
                ? `${Math.max(80, (Math.max(...verticalLevels) + 1) * 56)}px`
                : '80px',
            gridColumn: '2 / -1',
          }}
          onDoubleClick={() => onCreateClick(group.id, currentDate)}
          onDragOver={(e) => {
            e.preventDefault();
            const { time, targetDate } = mousePositionToTime(
              e,
              dateRange,
              currentDate
            );
            onDragOver(e, group.id, targetDate, time);
          }}
          onDragLeave={onDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            const { time, targetDate } = mousePositionToTime(
              e,
              dateRange,
              currentDate
            );
            onDrop(e, group.id, targetDate, time);
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${dateRange.length * 24}, 1fr)`,
            }}
          >
            {Array.from({ length: dateRange.length * 24 }, (_, i) => (
              <div
                key={i}
                className={`border-r ${
                  (i % 24) % 6 === 0 ? 'border-r-2' : ''
                }`}
              />
            ))}
          </div>

          {/* Items layer */}
          <div className="absolute inset-0">
            {/* Current time line */}
            <CurrentTimeIndicator dateRange={dateRange} />

            {/* Drop placeholder - show in hovered row, or in item's original group when drag starts */}
            {draggedItem && (dropTarget?.groupId === group.id || (!dropTarget && draggedItem.employeeId === group.id)) && (
              <DropPlaceholder
                draggedItem={draggedItem}
                dropTarget={dropTarget}
                viewMode={viewMode}
                computeDropPos={computeDropPos}
                snapToInterval={snapToInterval}
                timeToMinutes={timeToMinutes}
                t={t}
              />
            )}

            {/* Item cards */}
            {employeeItems
              .map((item, itemIndex) => {
                const position = calculateItemPosition(item);
                const verticalLevel = verticalLevels[itemIndex];
                const isAllDayItem = !!item.allDay;
                const isWeekView = viewMode === 'week';
                const isDayView = viewMode === 'day';

                // Find day offset using item.date (ISO string) compared to dateRange
                const itemDate = new Date(item.date + 'T00:00:00');
                const dayOffset = isWeekView
                  ? dateRange.findIndex((d) => isSameDay(d, itemDate)) * 24
                  : 0;

                let leftPercent: string;
                let widthPercent: string;

                if (isAllDayItem && isWeekView) {
                  const allDayIndex = dateRange.findIndex((d) =>
                    isSameDay(d, itemDate)
                  );
                  leftPercent = `${(allDayIndex / dateRange.length) * 100}%`;
                  widthPercent = `${100 / dateRange.length}%`;
                } else if (isDayView) {
                  leftPercent = `${position.left}%`;
                  widthPercent = `${position.width}%`;
                } else {
                  leftPercent = `${
                    ((dayOffset + position.startMinutes / 60) /
                      (dateRange.length * 24)) *
                    100
                  }%`;
                  widthPercent = `${
                    (position.duration / 60 / (dateRange.length * 24)) * 100
                  }%`;
                }

                const top = `${verticalLevel * 56 + 8}px`;

                const colorClass = isAllDayItem
                  ? `${item.color || itemTypes[item.type || 'default']?.color || 'bg-purple-500'} border-2 border-purple-400 font-bold`
                  : item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500';

                const showTimeLabel =
                  !isAllDayItem &&
                  (isDayView
                    ? position.duration >= 30
                    : position.duration >= 180);

                const compact = !isAllDayItem && position.duration < 60;

                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    leftPercent={leftPercent}
                    widthPercent={widthPercent}
                    top={top}
                    showTimeLabel={showTimeLabel}
                    isAllDayItem={isAllDayItem}
                    colorClass={colorClass}
                    compact={compact}
                    t={t}
                    canEdit={canEdit}
                    onItemClick={onItemClick}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

interface DropPlaceholderProps<T extends BaseScheduleItem = BaseScheduleItem> {
  draggedItem: T;
  dropTarget: { groupId: string; date: Date; time?: string } | null;
  viewMode: 'day' | 'week' | 'month' | 'year';
  computeDropPos: (
    targetDate: Date,
    timeStr?: string,
    item?: T
  ) => { left: number; width: number };
  snapToInterval: (minutes: number, interval?: number) => number;
  timeToMinutes: (timeString: string) => number;
  t: Translations;
}

function DropPlaceholder<T extends BaseScheduleItem>({
  draggedItem,
  dropTarget,
  viewMode,
  computeDropPos,
  snapToInterval,
  timeToMinutes,
  t,
}: DropPlaceholderProps<T>) {
  const pos = computeDropPos(dropTarget?.date, dropTarget?.time, draggedItem);

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${pos.left}%`,
        width: `${Math.max(pos.width, 2)}%`,
        top: '8px',
      }}
    >
      <div className="h-10 rounded bg-white/40 border-2 border-dashed border-white/60" />
      <div className="absolute -top-6 left-0 text-[11px] rounded bg-muted/90 text-black px-2 py-1 whitespace-nowrap">
        {draggedItem.allDay
          ? draggedItem.title
          : (() => {
              const [hours, minutes] = (dropTarget?.time || '00:00').split(':').map(Number);
              let startMinutes = hours * 60 + minutes;
              if (viewMode === 'day' || viewMode === 'week') {
                startMinutes = snapToInterval(startMinutes, 15);
              }
              const originalStartMinutes = timeToMinutes(
                draggedItem.startTime || '00:00'
              );
              const originalEndMinutes = timeToMinutes(
                draggedItem.endTime || '00:00'
              );
              const duration = originalEndMinutes - originalStartMinutes;
              const newStartHours = Math.floor(startMinutes / 60);
              const newStartMinutes = startMinutes % 60;
              const newEndMinutes = startMinutes + duration;
              const newEndHours = Math.floor(newEndMinutes / 60);
              const newEndMinutesRemainder = newEndMinutes % 60;
              const newStartTime = `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
              const newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutesRemainder).padStart(2, '0')}`;
              return `${draggedItem.title} • ${newStartTime}-${newEndTime}`;
            })()}
      </div>
    </div>
  );
}
