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

export enum ResponseDataHolidayType {
  COMPANY = "COMPANY",
  PARTIAL = "PARTIAL",
  ALL = "ALL",
  DAY_OFF = "DAY_OFF"
}
