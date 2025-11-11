// Translation strings for the Schedule Component
export type Language = "en" | "de" | "es" | "fr";

export interface Translations {
  // View controls
  view: string;
  period: string;
  calendar: string;
  timeline: string;
  day: string;
  week: string;
  month: string;
  year: string;
  today: string;

  // Actions
  newItem: string;
  add: string;

  // Messages
  noItemsForDay: string;
  noItems: string;
  timelineMobileMessage: string;
  moreItems: string;
  allDay: string;

  // Item types
  event: string;
  meeting: string;
  task: string;
  break: string;
  vacation: string;
  holiday: string;
  sickLeave: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    view: "View",
    period: "Period",
    calendar: "Calendar",
    timeline: "Timeline",
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year",
    today: "Today",
    newItem: "New Item",
    add: "Add",
    noItemsForDay: "No items for this day",
    noItems: "No items",
    timelineMobileMessage: "Timeline view is available on larger screens",
    moreItems: "more",
    allDay: "All Day",
    event: "Event",
    meeting: "Meeting",
    task: "Task",
    break: "Break",
    vacation: "Vacation",
    holiday: "Holiday",
    sickLeave: "Sick Leave",
  },
  de: {
    view: "Ansicht",
    period: "Zeitraum",
    calendar: "Kalender",
    timeline: "Zeitstrahl",
    day: "Tag",
    week: "Woche",
    month: "Monat",
    year: "Jahr",
    today: "Heute",
    newItem: "Neues Element",
    add: "Hinzufügen",
    noItemsForDay: "Keine Elemente für diesen Tag",
    noItems: "Keine Elemente",
    timelineMobileMessage:
      "Die Zeitleistenansicht ist auf größeren Bildschirmen verfügbar",
    moreItems: "mehr",
    allDay: "Ganztägig",
    event: "Ereignis",
    meeting: "Besprechung",
    task: "Aufgabe",
    break: "Pause",
    vacation: "Urlaub",
    holiday: "Feiertag",
    sickLeave: "Krankheit",
  },
  es: {
    view: "Vista",
    period: "Período",
    calendar: "Calendario",
    timeline: "Línea de tiempo",
    day: "Día",
    week: "Semana",
    month: "Mes",
    year: "Año",
    today: "Hoy",
    newItem: "Nuevo elemento",
    add: "Agregar",
    noItemsForDay: "No hay elementos para este día",
    noItems: "No hay elementos",
    timelineMobileMessage:
      "La vista de línea de tiempo está disponible en pantallas más grandes",
    moreItems: "más",
    allDay: "Todo el día",
    event: "Evento",
    meeting: "Reunión",
    task: "Tarea",
    break: "Descanso",
    vacation: "Vacaciones",
    holiday: "Festivo",
    sickLeave: "Baja médica",
  },
  fr: {
    view: "Vue",
    period: "Période",
    calendar: "Calendrier",
    timeline: "Chronologie",
    day: "Jour",
    week: "Semaine",
    month: "Mois",
    year: "Année",
    today: "Aujourd'hui",
    newItem: "Nouvel élément",
    add: "Ajouter",
    noItemsForDay: "Aucun élément pour ce jour",
    noItems: "Aucun élément",
    timelineMobileMessage:
      "La vue chronologique est disponible sur les écrans plus grands",
    moreItems: "plus",
    allDay: "Toute la journée",
    event: "Événement",
    meeting: "Réunion",
    task: "Tâche",
    break: "Pause",
    vacation: "Vacances",
    holiday: "Férié",
    sickLeave: "Maladie",
  },
};

export const getTranslation = (locale: string = "en"): Translations => {
  // Extract language code from locale (e.g., 'en-US' -> 'en', 'de-DE' -> 'de')
  const language = locale.split("-")[0] as Language;
  return translations[language] || translations.en;
};
