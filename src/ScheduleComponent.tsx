import './shadcn.css'
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isSameDay,
  parseISO,
} from 'date-fns';
import { de } from 'date-fns/locale';
import {
  ChevronLeft,

  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  BarChart3,
} from 'lucide-react';

import {
  ScheduleComponentProps,
  ViewMode,
  DisplayMode,
  DEFAULT_ITEM_TYPES,
  EMPLOYEE_COLORS,
} from './types';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { timeToMinutes, calculateItemPosition, calculateVerticalPosition } from './lib/scheduleHelpers';

export default function ScheduleComponent<T extends { id: string; employeeId: string; title: string; date: string; startTime?: string; endTime?: string; allDay?: boolean; type?: string; color?: string; notes?: string; [key: string]: any }, G extends { id: string; name: string; role?: string; color?: string; avatar?: string }>({
  items,
  groups,
  viewMode: initialViewMode = 'week',
  displayMode: initialDisplayMode = 'calendar',
  currentDate: initialCurrentDate = new Date(),
  itemTypes = DEFAULT_ITEM_TYPES,
  onItemClick,
  onItemCreate,
  onItemUpdate,
  className = '',
  showControls = true,
  showLegend = true,
  legendItems,
  locale = 'en',
  canCreate = true,
  canEdit = true,
  groupLabel = 'Employee',
  itemLabel = 'Item',
  showGroupRole = true,
  showGroupAvatar = true,
}: ScheduleComponentProps<T, G> & {
  groups: G[];
  groupLabel?: string;
  itemLabel?: string;
  showGroupRole?: boolean;
  showGroupAvatar?: boolean;
}) {
  const [currentDate, setCurrentDate] = useState(initialCurrentDate);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(initialDisplayMode);
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dropTarget, setDropTarget] = useState<{ groupId: string; date: Date; time?: string } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Convert string dates to Date objects for processing
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      dateObj: parseISO(item.date),
    }));
  }, [items]);

  // Calculate date ranges based on view mode
  const dateRange = useMemo(() => {
    // For timeline day view, show only current day for proper time alignment
    if (displayMode === 'timeline' && viewMode === 'day') {
      return [currentDate];
    }

    switch (viewMode) {
      case 'day':
        return [currentDate];
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      }
      case 'month': {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
      }
      case 'year': {
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        return eachMonthOfInterval({ start: yearStart, end: yearEnd });
      }
    }
  }, [currentDate, viewMode, displayMode]);

  // Scroll to current day/time when view changes
  useEffect(() => {
    if (scrollContainerRef.current && displayMode === 'timeline' && (viewMode === 'day' || viewMode === 'week')) {
      const today = new Date();
      const todayIndex = dateRange.findIndex(date => isSameDay(date, today));
      
      if (todayIndex !== -1) {
        // Calculate scroll position to center the current day
        const dayWidth = scrollContainerRef.current.scrollWidth / dateRange.length;
        const scrollLeft = (todayIndex * dayWidth) - (scrollContainerRef.current.clientWidth / 2) + (dayWidth / 2);
        
        scrollContainerRef.current.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        });
      }
    }
  }, [displayMode, viewMode, dateRange]);

  const now = new Date();
  const todayIndex = dateRange.findIndex(date => isSameDay(date, now));
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const totalMinutes = dateRange.length * 24 * 60;
  const showCurrentTimeLine = displayMode === 'timeline' && (viewMode === 'day' || viewMode === 'week') && todayIndex !== -1;
  const currentTimePosition = showCurrentTimeLine
    ? Math.min(100, Math.max(0,
        viewMode === 'day'
          ? (minutesSinceMidnight / (24 * 60)) * 100
          : ((todayIndex * 24 * 60 + minutesSinceMidnight) / totalMinutes) * 100
      ))
    : 0;
  const currentTimeLabel = format(now, 'HH:mm');

  const handleNavigate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, direction === 'next' ? 1 : -1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, direction === 'next' ? 1 : -1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, direction === 'next' ? 1 : -1));
        break;
      case 'year':
        setCurrentDate(addYears(currentDate, direction === 'next' ? 1 : -1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeLabel = () => {
    const dateLocale = locale === 'de' ? de : undefined;
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, dd. MMMM yyyy', { locale: dateLocale });
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'dd. MMM', { locale: dateLocale })} - ${format(weekEnd, 'dd. MMM yyyy', { locale: dateLocale })}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: dateLocale });
      case 'year':
        return format(currentDate, 'yyyy', { locale: dateLocale });
    }
  };

  const getItemsForGroupAndDate = (groupId: string, date: Date) => {
    return processedItems.filter(
      item => item.employeeId === groupId && isSameDay(item.dateObj, date)
    );
  };

  const getItemsForGroupAndMonth = (groupId: string, monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    return processedItems.filter(
      item => item.employeeId === groupId &&
      item.dateObj >= monthStart && item.dateObj <= monthEnd
    );
  };

  const handleItemClick = (item: T) => {
    onItemClick?.(item);
  };

  const handleCreateClick = (groupId?: string, date?: Date) => {
    if (onItemCreate && canCreate) {
      onItemCreate({
        employeeId: groupId,
        date: date ? format(date, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd'),
      } as Partial<T>);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: T) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
    // Set cursor to grabbing for better drag feedback
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDropTarget(null);
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    // Reset cursor to default
    document.body.style.cursor = 'default';
  };

  const handleDragOver = (e: React.DragEvent, groupId: string, date: Date, time?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // If we're in day/week timeline view and have a time, snap it to the grid
    let snappedTime = time;
    if (time && (displayMode === 'timeline') && (viewMode === 'day' || viewMode === 'week')) {
      const [h, m] = time.split(':').map(Number);
      const minutes = h * 60 + m;
      const snapped = snapToInterval(minutes, 15);
      const sh = Math.floor(snapped / 60);
      const sm = snapped % 60;
      snappedTime = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
    }
    setDropTarget({ groupId, date, time: snappedTime });
    // Ensure cursor stays as grabbing
    document.body.style.cursor = 'grabbing';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drop target if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setDropTarget(null);
    }
  };

  const snapToInterval = (minutes: number, interval: number = 15) => {
    return Math.round(minutes / interval) * interval;
  };

  const handleDrop = (e: React.DragEvent, groupId: string, date: Date, time?: string) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedItem || !onItemUpdate) return;

    const updates: Partial<T> = {
      employeeId: groupId,
      date: format(date, 'yyyy-MM-dd'),
    } as Partial<T>;

    // If time is provided (for timeline view) and item is not all-day, calculate new start/end times
    if (time && !draggedItem.allDay) {
      const [hours, minutes] = time.split(':').map(Number);
      let startMinutes = hours * 60 + minutes;
      
      // Snap to 15-minute intervals for day and week views
      if (viewMode === 'day' || viewMode === 'week') {
        startMinutes = snapToInterval(startMinutes, 15);
      }
      
      const originalStartMinutes = timeToMinutes(draggedItem.startTime!);
      const originalEndMinutes = timeToMinutes(draggedItem.endTime!);
      const duration = originalEndMinutes - originalStartMinutes;

      const newStartHours = Math.floor(startMinutes / 60);
      const newStartMinutes = startMinutes % 60;
      const newEndMinutes = startMinutes + duration;
      const newEndHours = Math.floor(newEndMinutes / 60);
      const newEndMinutesRemainder = newEndMinutes % 60;

      updates.startTime = `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}` as any;
      updates.endTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutesRemainder).padStart(2, '0')}` as any;
    }

    onItemUpdate(draggedItem.id, updates);
    setDraggedItem(null);
  };

  // Compute left/width percentages for a drop placeholder inside the timeline
  const computeDropPos = (targetDate: Date, timeStr?: string, item?: T) => {
    if (!timeStr || !item) return { left: 0, width: 0 };
    const [hours, minutes] = timeStr.split(':').map(Number);
    let startMinutes = hours * 60 + minutes;
    if (viewMode === 'day' || viewMode === 'week') {
      startMinutes = snapToInterval(startMinutes, 15);
    }

    const totalMinutes = dateRange.length * 24 * 60;
    // calculate absolute minutes from the beginning of the range
    const dayIndex = dateRange.findIndex(d => isSameDay(d, targetDate));
    const absoluteMinutes = Math.max(0, (dayIndex >= 0 ? dayIndex : 0) * 24 * 60 + startMinutes);

    const left = (absoluteMinutes / totalMinutes) * 100;

    const originalStart = item.allDay ? 0 : timeToMinutes(item.startTime!);
    const originalEnd = item.allDay ? 24 * 60 : timeToMinutes(item.endTime!);
    const duration = Math.max(15, originalEnd - originalStart);
    const width = (duration / totalMinutes) * 100;

    return { left, width };
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Schedule</h2>
          <p className="text-muted-foreground text-sm">Manage your schedule items</p>
        </div>
        {showControls && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleToday} variant="outline" size="sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Today
            </Button>
            {canCreate && (
              <Button onClick={() => handleCreateClick()} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Item
              </Button>
            )}
          </div>
        )}
      </div>

      {/* View Controls */}
      {showControls && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4">
              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => handleNavigate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-center text-sm sm:text-base min-w-0 flex-1 px-2">
                  {getDateRangeLabel()}
                </CardTitle>
                <Button variant="outline" size="icon" onClick={() => handleNavigate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* View Mode Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">View</span>
                  <Tabs>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="calendar"
                        className={`text-xs sm:text-sm ${displayMode === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setDisplayMode('calendar')}
                      >
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Calendar
                      </TabsTrigger>
                      <TabsTrigger
                        value="timeline"
                        className={`text-xs sm:text-sm ${displayMode === 'timeline' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setDisplayMode('timeline')}
                      >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Timeline
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Period</span>
                  <Tabs>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger
                        value="day"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'day' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('day')}
                      >
                        Day
                      </TabsTrigger>
                      <TabsTrigger
                        value="week"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'week' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('week')}
                      >
                        Week
                      </TabsTrigger>
                      <TabsTrigger
                        value="month"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'month' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('month')}
                      >
                        Month
                      </TabsTrigger>
                      <TabsTrigger
                        value="year"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'year' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('year')}
                      >
                        Year
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Legend */}
      {showLegend && (legendItems || Object.keys(itemTypes).length > 0) && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-2">
              {(legendItems || Object.entries(itemTypes)).map((item, index) => {
                const [key, config] = Array.isArray(item) ? item : [index, item];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${config.color}`} />
                    <span className="text-sm">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Calendar View */}
      {displayMode === 'calendar' && (
        <div className="border rounded-lg overflow-hidden bg-background">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="divide-y">
              {dateRange.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const allItems = groups.flatMap(group =>
                  getItemsForGroupAndDate(group.id, day).map(item => ({
                    ...item,
                    group
                  }))
                );

                const isDropTarget = dropTarget && isSameDay(dropTarget.date, day);

                return (
                  <div 
                    key={index} 
                    className={`p-4 ${isToday ? 'bg-primary/5' : ''} ${isDropTarget ? 'bg-primary/20' : ''}`} 
                    onDoubleClick={() => handleCreateClick(undefined, day)}
                    onDragOver={(e) => handleDragOver(e, '', day)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, draggedItem?.employeeId || '', day)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                          {format(day, 'EEEE, dd. MMMM yyyy', { locale: locale === 'de' ? de : undefined })}
                        </div>
                      </div>
                      {canCreate && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateClick(undefined, day)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {allItems.map((item) => (
                        <div
                          key={item.id}
                          className={`border rounded-lg p-3 hover:bg-muted/50 cursor-move transition-colors ${
                            item.allDay ? 'bg-purple-100 border-purple-300' : ''
                          }`}
                          onClick={() => handleItemClick(item)}
                          draggable={canEdit}
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${
                              item.allDay
                                ? 'bg-linear-to-r from-purple-500 to-purple-600'
                                : item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500'
                            }`}>
                              {item.allDay ? (
                                <CalendarIcon className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{item.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.group.name} • {item.allDay ? 'All Day' : `${item.startTime} - ${item.endTime}`}
                              </div>
                              {item.notes && (
                                <div className="text-sm text-muted-foreground mt-1">{item.notes}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {allItems.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No items for this day</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            {viewMode === 'month' && (
              <>
                <div className="grid grid-cols-7 bg-muted/50">
                  {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, index) => (
                    <div key={index} className="p-2 sm:p-4 text-center font-semibold border-r last:border-r-0 text-xs sm:text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {(() => {
                    const monthStart = startOfMonth(currentDate);
                    const monthEnd = endOfMonth(currentDate);
                    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
                    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

                    return calendarDays.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isToday = isSameDay(day, new Date());
                      const allItems = groups.flatMap(group =>
                        getItemsForGroupAndDate(group.id, day).map(item => ({
                          ...item,
                          group
                        }))
                      );

                      const isDropTarget = dropTarget && isSameDay(dropTarget.date, day);

                      return (
                        <div
                          key={index}
                          className={`min-h-20 sm:min-h-[120px] p-1 sm:p-2 border-r border-b last:border-r-0 group relative cursor-pointer hover:bg-muted/20 transition-colors ${
                            !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                          } ${isToday ? 'bg-primary/10' : ''} ${
                            (index % 7 === 5 || index % 7 === 6) ? 'bg-muted/10' : ''
                          } ${isDropTarget ? 'bg-primary/20' : ''}`}
                          onDoubleClick={() => handleCreateClick(undefined, day)}
                          onDragOver={(e) => handleDragOver(e, '', day)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, draggedItem?.employeeId || '', day)}
                        >
                          <div className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
                            isToday ? 'text-primary' : ''
                          }`}>
                            {format(day, 'd')}
                          </div>

                          <div className="space-y-1">
                            {allItems.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className={`text-xs p-1 rounded text-white cursor-move hover:opacity-80 transition-opacity ${
                                  item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500'
                                }`}
                                onClick={() => handleItemClick(item)}
                                draggable={canEdit}
                                onDragStart={(e) => handleDragStart(e, item)}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="truncate font-semibold">{item.group.name}</div>
                                <div className="truncate">{item.title}</div>
                              </div>
                            ))}
                            {allItems.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{allItems.length - 3} more
                              </div>
                            )}
                          </div>

                          {canCreate && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs"
                              onClick={() => handleCreateClick(undefined, day)}
                            >
                              +
                            </Button>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </>
            )}

            {viewMode === 'week' && (
              <>
                <div className="grid grid-cols-7 bg-muted/50">
                  {dateRange.map((day, index) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div key={index} className="p-4 text-center border-r last:border-r-0">
                        <div className="text-sm text-muted-foreground">
                          {format(day, 'EEE', { locale: locale === 'de' ? de : undefined })}
                        </div>
                        <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                          {format(day, 'd. MMM', { locale: locale === 'de' ? de : undefined })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-7">
                  {dateRange.map((day, index) => {
                    const isToday = isSameDay(day, new Date());
                    const allItems = groups.flatMap(group =>
                      getItemsForGroupAndDate(group.id, day).map(item => ({
                        ...item,
                        group
                      }))
                    );

                    const isDropTarget = dropTarget && isSameDay(dropTarget.date, day);

                    return (
                      <div
                        key={index}
                        className={`min-h-[150px] p-2 border-r border-b last:border-r-0 ${
                          isToday ? 'bg-primary/10' : ''
                        } ${isDropTarget ? 'bg-primary/20' : ''}`}
                        onDoubleClick={() => handleCreateClick(undefined, day)}
                        onDragOver={(e) => handleDragOver(e, '', day)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, draggedItem?.employeeId || '', day)}
                      >
                        <div className="space-y-1">
                          {allItems.map((item) => (
                            <div
                              key={item.id}
                              className={`text-xs p-2 rounded text-white cursor-move hover:opacity-80 transition-opacity ${
                                item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500'
                              }`}
                              onClick={() => handleItemClick(item)}
                              draggable={canEdit}
                              onDragStart={(e) => handleDragStart(e, item)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="font-semibold truncate">{item.group.name}</div>
                              <div className="truncate">{item.title}</div>
                              <div className="text-xs opacity-90">{item.startTime}-{item.endTime}</div>
                            </div>
                          ))}
                        </div>

                        {canCreate && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2 h-8 text-xs"
                            onClick={() => handleCreateClick(undefined, day)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === 'day' && (
              <div className="p-6" onDoubleClick={() => handleCreateClick(undefined, currentDate)}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold">
                    {format(currentDate, 'EEEE, dd. MMMM yyyy', { locale: locale === 'de' ? de : undefined })}
                  </h3>
                </div>

                <div className="space-y-3">
                  {groups.flatMap(group =>
                    getItemsForGroupAndDate(group.id, currentDate).map(item => ({
                      ...item,
                      group
                    }))
                  ).map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-move transition-colors"
                      onClick={() => handleItemClick(item)}
                      draggable={canEdit}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0 ${
                          item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500'
                        }`}>
                          <Clock className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">{item.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.group.name} • {item.startTime} - {item.endTime}
                              </div>
                            </div>
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-sm text-muted-foreground">{item.notes}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {groups.every(group => getItemsForGroupAndDate(group.id, currentDate).length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No items for this day</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'year' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {dateRange.map((month, monthIndex) => {
                  const monthItems = groups.flatMap(group =>
                    getItemsForGroupAndMonth(group.id, month).map(item => ({
                      ...item,
                      group
                    }))
                  );

                  return (
                    <div key={monthIndex} className="border rounded-lg overflow-hidden" onDoubleClick={() => handleCreateClick(undefined, month)}>
                      <div className="bg-muted/50 p-3 font-semibold text-center">
                        {format(month, 'MMMM', { locale: locale === 'de' ? de : undefined })}
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {monthItems.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              className={`text-xs p-2 rounded text-white cursor-move hover:opacity-80 transition-opacity ${
                                item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500'
                              }`}
                              onClick={() => handleItemClick(item)}
                              draggable={canEdit}
                              onDragStart={(e) => handleDragStart(e, item)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="font-semibold truncate">{item.group.name}</div>
                              <div className="text-xs opacity-90">{item.startTime}-{item.endTime}</div>
                            </div>
                          ))}

                          {monthItems.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              No items
                            </div>
                          )}

                          {monthItems.length > 5 && (
                            <div className="text-xs text-muted-foreground text-center pt-2">
                              +{monthItems.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {displayMode === 'timeline' && (
        <>
          {/* Mobile Message */}
          <div className="block sm:hidden">
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Timeline view is available on larger screens</p>
            </div>
          </div>

          {/* Desktop Timeline View */}
          <div className="hidden sm:block border rounded-lg overflow-hidden">
            {(viewMode === 'day' || viewMode === 'week') && (
              <>
                <div className="overflow-x-auto" ref={scrollContainerRef}>
                  <div className="relative min-w-[2000px]">
                    {/* Header */}
                    <div className="grid bg-muted/50" style={{
                      gridTemplateColumns: `200px repeat(${dateRange.length * 24}, 1fr)`
                    }}>
                      <div className="p-4 font-semibold border-r sticky left-0 bg-muted/50 z-10">{groupLabel}</div>

                      {dateRange.map((date, dayIndex) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                          <div
                            key={dayIndex}
                            className={`col-span-24 p-2 text-center border-r border-b font-semibold text-sm ${
                              isToday ? 'bg-primary/20 text-primary border-primary/30' : ''
                            }`}
                          >
                            {format(date, 'EEE, dd.MM', { locale: locale === 'de' ? de : undefined })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Hour Headers */}
                    <div className="grid bg-muted/50 border-b" style={{
                      gridTemplateColumns: `200px repeat(${dateRange.length * 24}, 1fr)`
                    }}>
                      <div className="border-r sticky left-0 bg-muted/50 z-10"></div>

                      {dateRange.map((date, dayIndex) => {
                        const isToday = isSameDay(date, new Date());
                        return Array.from({ length: 24 }, (_, hour) => (
                          <div
                            key={`${dayIndex}-${hour}`}
                            className={`flex items-center justify-center border-r text-[8px] leading-none text-muted-foreground py-1 px-0 ${
                              viewMode === 'day' || hour % 6 === 0 ? 'border-r-2 font-semibold' : ''
                            } ${isToday ? 'bg-primary/5' : ''}`}
                          >
                            {viewMode === 'day' || hour % 6 === 0 ? hour : ''}
                          </div>
                        ));
                      })}
                    </div>

                    {/* Group Rows */}
                    {groups.map((group) => {
                      const employeeItems = dateRange.flatMap(date =>
                        getItemsForGroupAndDate(group.id, date).map(item => ({
                          ...item,
                          displayDate: date
                        }))
                      );

                      // Calculate vertical positions based on overlaps per day
                      const verticalLevels: number[] = [];
                      dateRange.forEach(date => {
                        const dayItems = employeeItems.filter(item => isSameDay(item.displayDate, date));
                        const dayLevels = calculateVerticalPosition(dayItems);
                        verticalLevels.push(...dayLevels);
                      });

                      return (
                        <div key={group.id} className="border-t">
                          <div className="grid" style={{
                            gridTemplateColumns: `200px repeat(${dateRange.length * 24}, 1fr)`
                          }}>
                            <div className="p-4 border-r bg-background sticky left-0 z-10">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                  group.color || EMPLOYEE_COLORS[groups.indexOf(group) % EMPLOYEE_COLORS.length]
                                }`}>
                                  {showGroupAvatar && group.avatar ? (
                                    <img src={group.avatar} alt={group.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    group.name.split(' ').map(n => n[0]).join('')
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold">{group.name}</div>
                                  {showGroupRole && group.role && (
                                    <div className="text-sm text-muted-foreground">{group.role}</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div 
                              className={`relative col-span-full border-r bg-background ${
                                dropTarget?.groupId === group.id ? 'bg-primary/10' : ''
                              }`} 
                              style={{
                                minHeight: employeeItems.length > 0 ? `${Math.max(80, (Math.max(...verticalLevels) + 1) * 56)}px` : '80px',
                                gridColumn: '2 / -1'
                              }} 
                              onDoubleClick={() => handleCreateClick(group.id, currentDate)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                // Calculate the time based on mouse position for timeline view
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
                                
                                handleDragOver(e, group.id, targetDate, time);
                              }}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => {
                                e.preventDefault();
                                // Calculate the time based on mouse position
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
                                
                                handleDrop(e, group.id, targetDate, time);
                              }}
                            >
                              {/* Grid lines */}
                              <div className="absolute inset-0 grid" style={{
                                gridTemplateColumns: `repeat(${dateRange.length * 24}, 1fr)`
                              }}>
                                {Array.from({ length: dateRange.length * 24 }, (_, i) => (
                                  <div key={i} className={`border-r ${(i % 24) % 6 === 0 ? 'border-r-2' : ''}`} />
                                ))}
                              </div>

                              {/* Items (no inner padding so percentage positions match grid) */}
                              <div className="absolute inset-0">
                                {/* Current time line */}
                                {(() => {
                                  const now = new Date();
                                  const todayIndex = dateRange.findIndex(date => isSameDay(date, now));
                                  if (todayIndex !== -1) {
                                    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
                                    const totalMinutes = dateRange.length * 24 * 60;
                                    const dayOffset = todayIndex * 24 * 60;
                                    const position = ((dayOffset + minutesSinceMidnight) / totalMinutes) * 100;
                                    return (
                                      <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                                        style={{ left: `${position}%` }}
                                        title={`Current time: ${format(now, 'HH:mm')}`}
                                      ></div>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Drop placeholder for this group (timeline) */}
                                {draggedItem && dropTarget && dropTarget.groupId === group.id && (
                                  (() => {
                                    const pos = computeDropPos(dropTarget.date, dropTarget.time, draggedItem);
                                    return (
                                      <div
                                        className="absolute pointer-events-none z-20"
                                        style={{ left: `${pos.left}%`, width: `${Math.max(pos.width, 2)}%`, top: '8px' }}
                                      >
                                        <div className="h-10 rounded bg-white/40 border-2 border-dashed border-white/60" />
                                        <div className="absolute -top-6 left-0 text-[11px] rounded bg-muted/90 text-black px-2 py-1 whitespace-nowrap">
                                          {draggedItem.allDay
                                            ? draggedItem.title
                                            : (() => {
                                                // Calculate the proposed new time range
                                                const [hours, minutes] = dropTarget.time!.split(':').map(Number);
                                                let startMinutes = hours * 60 + minutes;
                                                if (viewMode === 'day' || viewMode === 'week') {
                                                  startMinutes = snapToInterval(startMinutes, 15);
                                                }
                                                const originalStartMinutes = timeToMinutes(draggedItem.startTime!);
                                                const originalEndMinutes = timeToMinutes(draggedItem.endTime!);
                                                const duration = originalEndMinutes - originalStartMinutes;
                                                const newStartHours = Math.floor(startMinutes / 60);
                                                const newStartMinutes = startMinutes % 60;
                                                const newEndMinutes = startMinutes + duration;
                                                const newEndHours = Math.floor(newEndMinutes / 60);
                                                const newEndMinutesRemainder = newEndMinutes % 60;
                                                const newStartTime = `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
                                                const newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutesRemainder).padStart(2, '0')}`;
                                                return `${draggedItem.title} • ${newStartTime}-${newEndTime}`;
                                              })()
                                          }
                                        </div>
                                      </div>
                                    );
                                  })()
                                )}

                                {employeeItems.map((item, itemIndex) => {
                                  const position = calculateItemPosition(item);
                                  const dayOffset = viewMode === 'week'
                                    ? dateRange.findIndex(d => isSameDay(d, item.displayDate)) * 24
                                    : 0;
                                  const left = viewMode === 'day'
                                    ? position.left
                                    : ((dayOffset + position.startMinutes / 60) / (dateRange.length * 24)) * 100;
                                  const verticalLevel = verticalLevels[itemIndex];

                                  return (
                                    <div
                                      key={item.id}
                                      className={`absolute rounded px-2 py-1 text-white text-xs cursor-move hover:opacity-80 transition-opacity ${
                                        item.allDay
                                          ? `${item.color || itemTypes[item.type || 'default']?.color || 'bg-purple-500'} border-2 border-purple-400 font-bold`
                                          : item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500'
                                      } ${position.duration < 60 && !item.allDay ? 'text-[10px] px-1 py-0.5' : ''}`}
                                      style={{
                                        left: item.allDay && viewMode === 'week'
                                          ? `${(dateRange.findIndex(d => isSameDay(d, item.displayDate)) / dateRange.length) * 100}%`
                                          : viewMode === 'day'
                                          ? `${position.left}%`
                                          : `${((dayOffset + position.startMinutes / 60) / (dateRange.length * 24)) * 100}%`,
                                        width: item.allDay && viewMode === 'week'
                                          ? `${100 / dateRange.length}%`
                                          : viewMode === 'day'
                                          ? `${position.width}%`
                                          : `${(position.duration / 60 / (dateRange.length * 24)) * 100}%`,
                                        top: `${verticalLevel * 56 + 8}px`,
                                      }}
                                      title={item.allDay ? `${item.title} (All Day)` : `${item.title} (${item.startTime}-${item.endTime})`}
                                      onClick={() => handleItemClick(item)}
                                      draggable={canEdit}
                                      onDragStart={(e) => handleDragStart(e, item)}
                                      onDragEnd={handleDragEnd}
                                    >
                                      <div className="font-semibold truncate">{item.title}</div>
                                      {item.allDay ? (
                                        <div className="text-xs opacity-90">All Day</div>
                                      ) : (viewMode === 'day' ? position.duration >= 30 : position.duration >= 180) && (
                                        <div className="text-xs opacity-90">
                                          {item.startTime}-{item.endTime}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Month/Year Timeline View */}
            {(viewMode === 'month' || viewMode === 'year') && (
              <>
                <div className="grid bg-muted/50" style={{
                  gridTemplateColumns: viewMode === 'year'
                    ? '200px repeat(12, 1fr)'
                    : `200px repeat(${dateRange.length}, 1fr)`
                }}>
                  <div className="p-4 font-semibold border-r">{groupLabel}</div>
                  {dateRange.map((date, index) => {
                    const isToday = viewMode !== 'year' && isSameDay(date, new Date());
                    return (
                      <div
                        key={index}
                        className={`p-2 text-center border-r last:border-r-0 text-xs ${
                          isToday ? 'bg-primary/10' : ''
                        }`}
                      >
                        {viewMode === 'year' ? (
                          <div className="font-semibold">
                            {format(date, 'MMM', { locale: locale === 'de' ? de : undefined })}
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-muted-foreground">
                              {format(date, 'EE', { locale: locale === 'de' ? de : undefined })}
                            </div>
                            <div className={`font-bold ${isToday ? 'text-primary' : ''}`}>
                              {format(date, 'd')}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {groups.map((group) => {
                  const employeeItems = viewMode === 'year'
                    ? dateRange.flatMap(month => getItemsForGroupAndMonth(group.id, month))
                    : dateRange.flatMap(date => getItemsForGroupAndDate(group.id, date));

                  return (
                    <div key={group.id} className="border-t">
                      <div className="grid" style={{
                        gridTemplateColumns: viewMode === 'year'
                          ? '200px repeat(12, 1fr)'
                          : `200px repeat(${dateRange.length}, 1fr)`
                      }}>
                        <div className="p-4 border-r bg-background">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              group.color || EMPLOYEE_COLORS[groups.indexOf(group) % EMPLOYEE_COLORS.length]
                            }`}>
                              {showGroupAvatar && group.avatar ? (
                                <img src={group.avatar} alt={group.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                group.name.split(' ').map(n => n[0]).join('')
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">{group.name}</div>
                              {showGroupRole && group.role && (
                                <div className="text-sm text-muted-foreground">{group.role}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`relative col-span-full border-r ${
                            dropTarget?.groupId === group.id ? 'bg-primary/10' : ''
                          }`} 
                          style={{
                            minHeight: employeeItems.length > 0 ? `${Math.max(80, employeeItems.length * 36)}px` : '80px',
                            gridColumn: '2 / -1'
                          }}
                          onDragOver={(e) => handleDragOver(e, group.id, currentDate)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, group.id, currentDate)}
                        >
                          <div className="absolute inset-0 grid" style={{
                            gridTemplateColumns: viewMode === 'year'
                              ? 'repeat(12, 1fr)'
                              : `repeat(${dateRange.length}, 1fr)`
                          }}>
                            {dateRange.map((_, index) => (
                              <div key={index} className="border-r last:border-r-0" />
                            ))}
                          </div>

                          <div className="absolute inset-0 p-2">
                            {employeeItems.map((item, itemIndex) => {
                              const columnIndex = viewMode === 'year'
                                ? dateRange.findIndex(d => d.getMonth() === item.dateObj.getMonth() && d.getFullYear() === item.dateObj.getFullYear())
                                : dateRange.findIndex(d => isSameDay(d, item.dateObj));

                              return (
                                <div
                                  key={item.id}
                                  className={`absolute rounded px-2 py-1 text-white text-xs cursor-move hover:opacity-80 transition-opacity ${
                                    item.color || itemTypes[item.type || 'default']?.color || 'bg-blue-500'
                                  }`}
                                  style={{
                                    left: `${(columnIndex / dateRange.length) * 100}%`,
                                    width: `${100 / dateRange.length}%`,
                                    top: `${itemIndex * 36 + 8}px`,
                                  }}
                                  title={`${item.title} (${item.startTime}-${item.endTime})`}
                                  onClick={() => handleItemClick(item)}
                                  draggable={canEdit}
                                  onDragStart={(e) => handleDragStart(e, item)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <div className="font-semibold truncate">{item.title}</div>
                                  <div className="text-xs opacity-90">
                                    {item.startTime}-{item.endTime}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}