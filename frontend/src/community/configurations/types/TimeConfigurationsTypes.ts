import { daysTypes } from "~community/common/constants/stringConstants";

export interface WorkingDaysTypes {
  id: number;
  day: string;
}

export interface DaysOfWeekTypes {
  label: string;
  value: string;
  startOfTheWeek?: boolean;
}

export interface TimeConfigurationType {
  day: daysTypes;
  timeBlocks: Array<TimeBlocksTypes>;
  totalHours: number;
  isWeekStartDay?: boolean;
  startTime?: string;
}

export interface TimeBlocksTypes {
  hours: number;
  timeBlock: string;
}

export interface DefaultDayCapacityType {
  id: number;
  day: daysTypes;
  timeBlocks: Array<string | null | TimeBlocksTypes>;
  totalHours: number;
  isWeekStartDay?: boolean;
  startTime?: string;
  time?: string;
}

export interface TimeConfigurationDataType {
  data: TimeConfigurationType;
}

export type DayAvailability = {
  [key in daysTypes]: boolean;
};
