export type CalendarType = 'GREGORIAN' | 'LUNAR';

export type RecurrenceType = 'NONE' | 'ANNUALLY';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE';

export type ImportantDateCategory =
  | 'BUDDHIST_HOLIDAY'
  | 'CHANTING_DAY'
  | 'FULL_MOON_DAY'
  | 'FASTING_DAY'
  | 'MEMORIAL_DAY'
  | 'OTHER';

export interface ImportantDateItemType {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category: ImportantDateCategory;
  calendarType: CalendarType;
  solarDate?: string | null;
  solarDay?: number | null;
  solarMonth?: number | null;
  solarYear?: number | null;
  lunarDay?: number | null;
  lunarMonth?: number | null;
  lunarYear?: number | null;
  isLeapMonth: boolean;
  recurrence: RecurrenceType;
  badgeColor?: string | null;
  priority: number;
  status: EventStatus;
  createdById?: string | null;
  updatedById?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string } | null;
  updatedBy?: { id: string; name: string; email: string } | null;
}

export interface UpcomingImportantDateResponse {
  event: ImportantDateItemType;
  occurrenceDate: string; // YYYY-MM-DD
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeapMonth: boolean;
  canChiYear: string;
  lunarFormatted: string;
  daysRemaining: number;
  countdownText: string;
  isToday: boolean;
  coOccurringEvents: ImportantDateItemType[];
  totalEventsOnDate: number;
}

export interface CalendarDayItem {
  solarDate: string; // YYYY-MM-DD
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  dayOfWeek: number; // 0 = CN, 1 = T2, ..., 6 = T7
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeapMonth: boolean;
  canChiYear: string;
  lunarFormatted: string;
  isRam: boolean;
  isMung1: boolean;
  isToday: boolean;
  events: ImportantDateItemType[];
}

export interface MonthCalendarResponse {
  year: number;
  month: number;
  totalEvents: number;
  days: CalendarDayItem[];
}

export interface CreateImportantDatePayload {
  title: string;
  description?: string;
  category?: ImportantDateCategory;
  calendarType: CalendarType;
  solarDate?: string;
  solarDay?: number;
  solarMonth?: number;
  solarYear?: number;
  lunarDay?: number;
  lunarMonth?: number;
  lunarYear?: number;
  isLeapMonth?: boolean;
  recurrence?: RecurrenceType;
  badgeColor?: string;
  priority?: number;
  status?: EventStatus;
}

export type UpdateImportantDatePayload = Partial<CreateImportantDatePayload>;

export interface QueryAdminImportantDateParams {
  search?: string;
  status?: EventStatus;
  category?: ImportantDateCategory;
  calendarType?: CalendarType;
  year?: number;
  month?: number;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminImportantDateListResponse {
  data: ImportantDateItemType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

