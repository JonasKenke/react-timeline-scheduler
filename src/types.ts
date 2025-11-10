// Schedule Component Types
export type ViewMode = "day" | "week" | "month" | "year";
export type DisplayMode = "calendar" | "timeline";

// Base interfaces for configurable data
export interface BaseGroup {
  id: string;
  name: string;
  role?: string;
  color?: string;
  avatar?: string;
}

// Alias for backward compatibility
export type BaseEmployee = BaseGroup;

export interface BaseScheduleItem {
  id: string;
  employeeId: string;
  title: string;
  date: string; // ISO date string
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  type?: string;
  color?: string;
  notes?: string;
  // Allow custom properties
  [key: string]: any;
}

// Component props interface
export interface ScheduleComponentProps<
  T extends BaseScheduleItem = BaseScheduleItem,
  G extends BaseGroup = BaseGroup
> {
  // Data
  items: T[];
  groups: G[];

  // Configuration
  viewMode?: ViewMode;
  displayMode?: DisplayMode;
  currentDate?: Date;

  // Customization
  itemTypes?: Record<
    string,
    {
      label: string;
      color: string;
      icon?: string;
    }
  >;

  // Event handlers
  onItemClick?: (item: T) => void;
  onItemCreate?: (data: Partial<T>) => void;
  onItemUpdate?: (id: string, data: Partial<T>) => void;

  // UI customization
  className?: string;
  showControls?: boolean;
  showLegend?: boolean;
  legendItems?: Array<{
    label: string;
    color: string;
    icon?: string;
  }>;
  locale?: string;

  // Permissions
  canCreate?: boolean;
  canEdit?: boolean;
}

// Default configurations
export const DEFAULT_ITEM_TYPES = {
  default: {
    label: "Event",
    color: "bg-blue-500",
  },
  meeting: {
    label: "Meeting",
    color: "bg-green-500",
  },
  task: {
    label: "Task",
    color: "bg-orange-500",
  },
  break: {
    label: "Break",
    color: "bg-gray-500",
  },
  vacation: {
    label: "Vacation",
    color: "bg-purple-500",
  },
  holiday: {
    label: "Holiday",
    color: "bg-red-500",
  },
  sick: {
    label: "Sick Leave",
    color: "bg-yellow-500",
  },
};

export const EMPLOYEE_COLORS = [
  "bg-pink-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
];
