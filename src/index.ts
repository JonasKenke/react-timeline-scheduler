import "./shadcn.css";

export { default as ScheduleComponent } from "./ScheduleComponent";
export type {
  ScheduleComponentProps,
  ViewMode,
  DisplayMode,
  BaseGroup,
  BaseEmployee,
  BaseScheduleItem,
} from "./types";

export type { Translations } from "./lib/translations";

export { DEFAULT_ITEM_TYPES, EMPLOYEE_COLORS } from "./types";
export { translations, getTranslation } from "./lib/translations";
