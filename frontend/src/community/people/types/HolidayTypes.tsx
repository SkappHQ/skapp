export interface HolidayDataType {
  id?: number;
  date?: string;
  name?: string;
  holidayType?: string;
  holidayDuration?: string;
  holidayColor?: string;
  holidayDate?: string;
  duration?: string | HolidayDurationType;
  halfDayState?: string | HolidayDurationType;
  holidayReason?: string;
  holidayId?: number;
  workLocations?: string[];
}

export interface holiday {
  id?: number;
  date?: string;
  name?: string;
  holidayDuration?: HolidayDurationType;
  holidayColor?: string;
}
export interface HolidayDataPreprocessedType {
  [key: string]: string;
  id: string;
  date: string;
}

export enum HolidayDurationType {
  FULLDAY = "FULL_DAY",
  HALFDAY = "HALFDAY",
  HALFDAY_MORNING = "HALF_DAY_MORNING",
  HALFDAY_EVENING = "HALF_DAY_EVENING",
  NONE = ""
}

export enum HolidayHalfDayState {
  MORNING = "Morning",
  EVENING = "Evening",
  NONE = ""
}

export enum ResponseDataHolidayType {
  COMPANY = "COMPANY",
  PARTIAL = "PARTIAL",
  ALL = "ALL",
  DAY_OFF = "DAY_OFF"
}

export interface HolidayDataByDateType {
  date: string;
  holidayColor: string | null;
  holidayDuration:
    | "FULLDAY"
    | "HALFDAY_MORNING"
    | "HALFDAY_EVENING"
    | "EXTENDED"
    | null;
  holidayType?: ResponseDataHolidayType;
  id: number | null;
  name: string;
}

export enum cardTypes {
  FULLTEAM = "Full Team",
  WEEKEND = "Weekend",
  DAYOFF = "DayOff"
}

export enum holidayModalTypes {
  HOLIDAY_INDIVIDUAL_DELETE = "HOLIDAY_INDIVIDUAL_DELETE",
  HOLIDAY_SELECTED_DELETE = "HOLIDAY_SELECTED_DELETE",
  HOLIDAY_BULK_DELETE = "HOLIDAY_BULK_DELETE",
  HOLIDAY_EXIT_CONFIRMATION = "HOLIDAY_EXIT_CONFIRMATION",
  SELECT_HOLIDAY_DATE = "SELECT_HOLIDAY_DATE",
  ADD_EDIT_HOLIDAY = "ADD_EDIT_HOLIDAY",
  CALENDAR_ADDED_SUCCESS = "CALENDAR_ADDED_SUCCESS",
  ADD_CALENDAR = "ADD_CALENDAR",
  UPLOAD_SUMMARY = "UPLOAD_SUMMARY",
  UPLOAD_HOLIDAY_BULK = "UPLOAD_HOLIDAY_BULK",
  LEAVE = "LEAVE",
  NONE = "NONE"
}

export interface holidayDataParamTypes {
  sortOrder?: string;
  page?: string | number;
  isPagination?: boolean;
  holidayTypes?: string;
  colors?: string | string[];
  holidayDurations?: string;
}

export enum HolidayDeleteType {
  ALL = "ALL",
  SELECTED = "SELECTED",
  INDIVIDUAL = "INDIVIDUAL"
}

export interface GoogleCalendarResponseTypes {
  start: {
    date: string;
  };
  summary: string;
}

export type addedHolidays = {
  date: string;
  name: string;
  holidayType?: string;
};

export type HolidayCSVRowType = {
  date: string;
  name: string;
  holidayDuration: HolidayDurationType;
  workLocation?: string;
};

export type HolidayType = {
  date: string;
  name: string;
  holidayDuration: HolidayDurationType;
  workLocations?: string[];
};

export interface bulkStatusSummary {
  successCount: number;
  failedCount: number;
}

export interface HolidayBulkRecordErrorLogType {
  status: string;
  errorMessage: string;
  holiday?: HolidayType;
}

export interface holidayBulkUploadResponse {
  bulkStatusSummary: bulkStatusSummary;
  bulkRecordErrorLogs: HolidayBulkRecordErrorLogType[];
}

export type Holiday = {
  id: number;
  date: string;
  workLocations?: string[];
  name: string;
  holidayDuration:
    | HolidayDurationType.FULLDAY
    | HolidayDurationType.HALFDAY_EVENING
    | HolidayDurationType.HALFDAY_MORNING;
};

export type HolidayDataResponse = {
  currentPage?: number;
  items: Holiday[];
  totalItems?: number;
  totalPages?: number;
  pages: any;
  pageParams: number[];
};

export interface BulkHolidayUploadParams {
  holidayData: HolidayDataType[];
  selectedYear: string;
}

export type holidayIndividualAddParams = {
  holidayData: HolidayDataType;
  selectedYear: string;
};
