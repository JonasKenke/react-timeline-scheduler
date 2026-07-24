import './shadcn.css';
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
  Users,
} from 'lucide-react';

import {
  ScheduleComponentProps,
  ViewMode,
  DisplayMode,
  getDefaultItemTypes,
  EMPLOYEE_COLORS,
  BaseGroup,
} from './types';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { timeToMinutes, calculateVerticalPosition } from './lib/scheduleHelpers';
import { getTranslation } from './lib/translations';
import { TimelineHeader } from './components/TimelineHeader';
import { TimelineRow } from './components/TimelineRow';
export default function ScheduleComponent<T extends { id: string; employeeId: string; title: string; date: string; startTime?: string; endTime?: string; allDay?: boolean; type?: string; color?: string; notes?: string; [key: string]: any }, G extends BaseGroup>({
  items,
  groups,
  viewMode: initialViewMode = 'week',
  displayMode: initialDisplayMode = 'calendar',
  currentDate: initialCurrentDate = new Date(),
  locale = 'en',
  customTranslations,
  itemTypes = getDefaultItemTypes(locale),
  onItemClick,
  onItemCreate,
  onItemUpdate,
  className = '',
  showControls = true,
  showLegend = true,
  legendItems,
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

  // Get translations based on locale prop and merge with custom translations
  const defaultTranslations = getTranslation(locale);
  const t = customTranslations ? { ...defaultTranslations, ...customTranslations } : defaultTranslations;

  // Convert string dates to Date objects for processing
  const processedItems = useMemo(() => {
    return items
      .filter(item => item != null)
      .map(item => ({
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
      {showControls && (
        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={handleToday} variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {t.today}
          </Button>
          {canCreate && (
            <Button onClick={() => handleCreateClick()} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t.newItem}
            </Button>
          )}
        </div>
      )}

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
                  <span className="text-sm font-medium text-muted-foreground">{t.view}</span>
                  <Tabs>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="calendar"
                        className={`text-xs sm:text-sm ${displayMode === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setDisplayMode('calendar')}
                      >
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {t.calendar}
                      </TabsTrigger>
                      <TabsTrigger
                        value="timeline"
                        className={`text-xs sm:text-sm ${displayMode === 'timeline' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setDisplayMode('timeline')}
                      >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {t.timeline}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{t.period}</span>
                  <Tabs>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger
                        value="day"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'day' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('day')}
                      >
                        {t.day}
                      </TabsTrigger>
                      <TabsTrigger
                        value="week"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'week' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('week')}
                      >
                        {t.week}
                      </TabsTrigger>
                      <TabsTrigger
                        value="month"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'month' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('month')}
                      >
                        {t.month}
                      </TabsTrigger>
                      <TabsTrigger
                        value="year"
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${viewMode === 'year' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'}`}
                        onClick={() => setViewMode('year')}
                      >
                        {t.year}
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
                          {t.add}
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
                                {item.group.name} • {item.allDay ? t.allDay : `${item.startTime} - ${item.endTime}`}
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
                          <p className="text-sm">{t.noItemsForDay}</p>
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
                                +{allItems.length - 3} {t.moreItems}
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
                            {t.add}
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
                      <p>{t.noItemsForDay}</p>
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
                              {t.noItems}
                            </div>
                          )}

                          {monthItems.length > 5 && (
                            <div className="text-xs text-muted-foreground text-center pt-2">
                              +{monthItems.length - 5} {t.moreItems}
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
              <p className="text-sm">{t.timelineMobileMessage}</p>
            </div>
          </div>

          {/* Desktop Timeline View */}
          <div className="hidden sm:block border rounded-lg overflow-hidden">
            {(viewMode === 'day' || viewMode === 'week') && (
              <div className="overflow-x-auto" ref={scrollContainerRef}>
                <div className="relative min-w-[2000px]">
                  <TimelineHeader
                    dateRange={dateRange}
                    viewMode={viewMode}
                    groupLabel={groupLabel}
                    locale={locale}
                  />

                  {/* Group Rows */}
                  {(() => {
                    const calculateLevels = (items: T[]) => {
                      const levels: number[] = [];
                      dateRange.forEach((date) => {
                        const dayItems = items.filter(
                          (item: T & { displayDate?: Date }) => item.displayDate && isSameDay(item.displayDate, date)
                        );
                        const dayLevels = calculateVerticalPosition(dayItems);
                        levels.push(...dayLevels);
                      });
                      return levels;
                    };

                    const hasGroups = groups.some(
                      (group: G) => group.groupId
                    );

                    const getItems = (group: G) =>
                      dateRange.flatMap((date) =>
                        getItemsForGroupAndDate(group.id, date).map(
                          (item) => ({
                            ...item,
                            displayDate: date,
                          })
                        )
                      );

                    if (!hasGroups) {
                      return groups.map((group: G) => {
                        const employeeItems = getItems(group);
                        const verticalLevels = calculateLevels(employeeItems);

                        return (
                          <TimelineRow
                            key={group.id}
                            group={group}
                            groups={groups}
                            employeeItems={employeeItems}
                            verticalLevels={verticalLevels}
                            dateRange={dateRange}
                            viewMode={viewMode}
                            currentDate={currentDate}
                            draggedItem={draggedItem}
                            dropTarget={dropTarget}
                            itemTypes={itemTypes}
                            t={t}
                            canEdit={canEdit}
                            canCreate={canCreate}
                            showGroupRole={showGroupRole}
                            showGroupAvatar={showGroupAvatar}
                            groupColors={EMPLOYEE_COLORS}
                            locale={locale}
                            onItemClick={handleItemClick}
                            onCreateClick={handleCreateClick}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            computeDropPos={computeDropPos}
                            snapToInterval={snapToInterval}
                            timeToMinutes={timeToMinutes}
                          />
                        );
                      });
                    }

                    const groupedGroups = groups.reduce(
                      (acc: Record<string, G[]>, group: G) => {
                        const key = group.groupId || 'Unassigned';
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(group);
                        return acc;
                      },
                      {} as Record<string, G[]>
                    );

                    return Object.entries(groupedGroups).map(
                      ([gId, gGroups]) => (
                        <div key={gId}>
                          <div className="flex items-center gap-2 p-3 bg-muted/30 border-t font-semibold">
                            <Users className="h-4 w-4" />
                            {gId}
                            <span className="text-sm text-muted-foreground font-normal">
                              ({gGroups.length}{' '}
                              {groupLabel.toLowerCase()})
                            </span>
                          </div>
                          {gGroups.map((group) => {
                            const employeeItems = getItems(group);
                            const verticalLevels =
                              calculateLevels(employeeItems);

                            return (
                              <TimelineRow
                                key={group.id}
                                group={group}
                                groups={groups}
                                employeeItems={employeeItems}
                                verticalLevels={verticalLevels}
                                dateRange={dateRange}
                                viewMode={viewMode}
                                currentDate={currentDate}
                                draggedItem={draggedItem}
                                dropTarget={dropTarget}
                                itemTypes={itemTypes}
                                t={t}
                                canEdit={canEdit}
                                canCreate={canCreate}
                                showGroupRole={showGroupRole}
                                showGroupAvatar={showGroupAvatar}
                                groupColors={EMPLOYEE_COLORS}
                                locale={locale}
                                onItemClick={handleItemClick}
                                onCreateClick={handleCreateClick}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                computeDropPos={computeDropPos}
                                snapToInterval={snapToInterval}
                                timeToMinutes={timeToMinutes}
                              />
                            );
                          })}
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}