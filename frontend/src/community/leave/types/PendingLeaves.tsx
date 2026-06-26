export interface LeaveRequestFilters {
  page?: number;
  size?: number;
}

export interface LeaveRequest {
  leaveRequestId: number;
  employee: {
    firstName: string;
    lastName: string;
    authPic: string;
  };

  startDate: string;
  endDate: string;
  durationDays: number;

  leaveType: {
    emojiCode: string;
    name: string;
  };
}

export enum PendingLeaveEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED"
}

export const LEAVE_REQUESTS_URL = "/leave/leave-requests";
