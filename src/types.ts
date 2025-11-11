// Schedule Component Types
export type ViewMode = "day" | "week" | "month" | "year";
export type DisplayMode = "calendar" | "timeline";

import type { Translations } from "./lib/translations";

// Base interfaces for configurable data
export interface BaseGroup {
  id: string;
  name: string;
  role?: string;
  color?: string;
  avatar?: string;
  groupId?: string; // Optional group ID for grouping items
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
  customTranslations?: Partial<Translations>;

  // Permissions
  canCreate?: boolean;
  canEdit?: boolean;
}

// Default configurations
import { getTranslation } from "./lib/translations";

export const getDefaultItemTypes = (language?: string) => {
  const t = getTranslation(language);
  return {
    default: {
      label: t.event,
      color: "bg-blue-500",
    },
    meeting: {
      label: t.meeting,
      color: "bg-green-500",
    },
    task: {
      label: t.task,
      color: "bg-orange-500",
    },
    break: {
      label: t.break,
      color: "bg-gray-500",
    },
    vacation: {
      label: t.vacation,
      color: "bg-purple-500",
    },
    holiday: {
      label: t.holiday,
      color: "bg-red-500",
    },
    sick: {
      label: t.sickLeave,
      color: "bg-yellow-500",
    },
  };
};

// Backward compatibility
export const DEFAULT_ITEM_TYPES = getDefaultItemTypes();

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
