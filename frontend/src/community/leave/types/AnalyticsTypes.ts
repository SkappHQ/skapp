import { SummarizedLeaveType } from "./MyRequests";

export type PieChartPosition = "center" | "bottom";

export type PieChartSeriesData = {
  name: string;
  value: number;
};

export interface LeaveHistoryRawType {
  employeeId?: number;
  email?: string;
  authPic?: string;
  name?: string;
  lastName?: string;
  leaveRequestId: number;
  startDate: string;
  endDate: string;
  leaveType: SummarizedLeaveType;
  leaveState: string;
  status: string;
  durationHours: number;
  durationDays: number;
  createdDate: string;
  requestDesc: string;
  viewed: boolean;
}

export interface LeaveHistoryDataTypes {
  currentPage: number;
  items: LeaveHistoryRawType[];
  totalItems: number;
  totalPages: number;
}

export interface DownloadDataAsCSVType {
  data: LeaveHistoryRawType[];
}

export type ToggleState = Record<string, boolean>;
