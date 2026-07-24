import { Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { NavigationControls } from './NavigationControls';
import type { ViewMode, DisplayMode } from '../types';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  displayMode: DisplayMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  dateRangeLabel: string;
  t: Record<string, string>;
}

/**
 * View controls card with navigation (prev/next), date range label,
 * display mode toggle (calendar/timeline), and view period toggle (day/week/month/year).
 */
export function ViewModeToggle({
  viewMode,
  displayMode,
  onViewModeChange,
  onDisplayModeChange,
  onNavigate,
  dateRangeLabel,
  t,
}: ViewModeToggleProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          {/* Navigation Controls */}
          <NavigationControls onNavigate={onNavigate} />

          {/* Date Range Title */}
          <CardTitle className="text-center text-sm sm:text-base min-w-0 flex-1 px-2">
            {dateRangeLabel}
          </CardTitle>

          {/* View Mode Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t.view}
              </span>
              <Tabs>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="calendar"
                    className={`text-xs sm:text-sm ${
                      displayMode === 'calendar'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => onDisplayModeChange('calendar')}
                  >
                    <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t.calendar}
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className={`text-xs sm:text-sm ${
                      displayMode === 'timeline'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => onDisplayModeChange('timeline')}
                  >
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t.timeline}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t.period}
              </span>
              <Tabs>
                <TabsList className="grid w-full grid-cols-4">
                  {(['day', 'week', 'month', 'year'] as const).map(
                    (period) => (
                      <TabsTrigger
                        key={period}
                        value={period}
                        className={`text-xs sm:text-sm px-1 sm:px-3 ${
                          viewMode === period
                            ? 'bg-background text-foreground shadow-sm'
                            : 'hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={() => onViewModeChange(period)}
                      >
                        {t[period]}
                      </TabsTrigger>
                    )
                  )}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
