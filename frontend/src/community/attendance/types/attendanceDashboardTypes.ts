export interface ClockInOutGraphDataType {
  recordType: string;
  teams: string | number;
  timeOffset: string;
  date: string;
}

export interface LateArrivalsGraphDataType {
  teams: string | number;
  trendPeriod: string;
}

export interface WorkHoursGraphDataType {
  month: string;
  teams: number | string;
}

export interface ClockInSummaryParamType {
  teams: string | number;
  clockInType: string;
  date: string;
  searchKeyword: string;
}
