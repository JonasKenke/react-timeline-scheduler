import { isSameDay, format } from 'date-fns';

interface CurrentTimeIndicatorProps {
  dateRange: Date[];
}

/**
 * Renders a red vertical line at the current time position within the timeline.
 * Only renders when today is within the visible date range.
 */
export function CurrentTimeIndicator({ dateRange }: CurrentTimeIndicatorProps) {
  const now = new Date();
  const todayIndex = dateRange.findIndex((date) => isSameDay(date, now));

  if (todayIndex === -1) return null;

  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const totalMinutes = dateRange.length * 24 * 60;
  const dayOffset = todayIndex * 24 * 60;
  const position = ((dayOffset + minutesSinceMidnight) / totalMinutes) * 100;

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
      style={{ left: `${position}%` }}
      title={`Current time: ${format(now, 'HH:mm')}`}
    />
  );
}
