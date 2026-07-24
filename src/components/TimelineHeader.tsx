import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface TimelineHeaderProps {
  dateRange: Date[];
  viewMode: 'day' | 'week' | 'month' | 'year';
  groupLabel: string;
  locale: string;
}

/**
 * Renders the timeline header with date column headers and hour grid labels.
 * Includes a sticky group label column on the left.
 */
export function TimelineHeader({
  dateRange,
  viewMode,
  groupLabel,
  locale,
}: TimelineHeaderProps) {
  const dateLocale = locale === 'de' ? de : undefined;

  return (
    <>
      {/* Date Header Row */}
      <div
        className="grid bg-muted/50"
        style={{
          gridTemplateColumns: `200px repeat(${dateRange.length * 24}, 1fr)`,
        }}
      >
        <div className="p-4 font-semibold border-r sticky left-0 bg-muted/50 z-10">
          {groupLabel}
        </div>

        {dateRange.map((date, dayIndex) => {
          const isToday = isSameDay(date, new Date());
          return (
            <div
              key={dayIndex}
              className={`col-span-24 p-2 text-center border-r border-b font-semibold text-sm ${
                isToday
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : ''
              }`}
            >
              {format(date, 'EEE, dd.MM', { locale: dateLocale })}
            </div>
          );
        })}
      </div>

      {/* Hour Headers Row */}
      <div
        className="grid bg-muted/50 border-b"
        style={{
          gridTemplateColumns: `200px repeat(${dateRange.length * 24}, 1fr)`,
        }}
      >
        <div className="border-r sticky left-0 bg-muted/50 z-10" />

        {dateRange.map((date, dayIndex) => {
          const isToday = isSameDay(date, new Date());
          return Array.from({ length: 24 }, (_, hour) => (
            <div
              key={`${dayIndex}-${hour}`}
              className={`flex items-center justify-center border-r text-[8px] leading-none text-muted-foreground py-1 px-0 ${
                viewMode === 'day' || hour % 6 === 0
                  ? 'border-r-2 font-semibold'
                  : ''
              } ${isToday ? 'bg-primary/5' : ''}`}
            >
              {viewMode === 'day' || hour % 6 === 0 ? hour : ''}
            </div>
          ));
        })}
      </div>
    </>
  );
}
