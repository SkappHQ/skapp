export type GetEmployeeLeaveReportPreProcessedType = {
  items: ReportTableRowDataType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

export type ReportTableRowDataType = {
  leaveEntitlementReportDtos: leaveEntitlementReportDtosType[];
  employeeId: number;
  authPic: string;
  firstName: string;
  lastName: string;
};

export type leaveEntitlementReportDtosType = {
  leaveTypeId: number;
  allocation: string;
};

export type processedLeaveEntitlementType = {
  leaveTypeId?: number;
  leaveName?: string;
  totalBalanceDays?: number;
  totalDaysAllocated?: number;
  totalDaysUsed?: number;
};

export type LeaveRequest = {
  employeeId: number;
  employeeName: string;
  teams: string;
  jobFamily: string;
  leavePeriod: string;
  durationDays: number;
  leaveType: string;
  dateRequested: string;
  status: string;
  reason: string;
};

export type CustomAllocation = {
  employeeId: number;
  employeeName: string;
  teams: string;
  jobFamily: string;
  leaveType: string;
  days: number;
  startDate: string;
  endDate: string;
};

export type LeaveEntitlement = {
  employeeId: number;
  employeeName: string;
  teams: string;
  jobFamily: string;
  employeeLeaveEntitlementsDtos: processedLeaveEntitlementType[];
};

export type CSVResponse = {
  employeeCustomEntitlementTeamJobRoles: CustomAllocation[];
  employeeEntitlementTeamJobRoleDto: LeaveEntitlement[];
  employeeLeaveRequestTeamJobRoleReports: LeaveRequest[];
};

export type LeaveEntitlements = {
  employeeId: number;
  authPic: string;
  name: string;
  lastName: string;
  leaveEntitlementReportDtos: processedLeaveEntitlementType[];
};

export type ApiResponse = {
  items: LeaveEntitlements[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

export type ReportsParams = {
  year: string;
  leaveTypeId: string;
  jobRoleId: string;
  teamId: string;
  page: number;
  size: number;
  sortKey: string;
  sortOrder: string;
  leaveStatus: string;
};

export type processedCustomAllocationType = {
  employeeName: string;
  teams: string;
  jobFamily: string;
  leaveType: string;
  days: number;
  startDate: string;
  endDate: string;
};

export type processedLeaveEntitlements = {
  employeeName: string;
  teams: string;
  jobFamily: string;
  leaveEntitlementReportDtos: processedLeaveEntitlementType[];
};

export type processedLeaveRequests = {
  employeeName: string;
  teams: string;
  jobFamily: string;
  leavePeriod: string;
  durationDays: number;
  leaveType: string;
  dateRequested: string;
  status: string;
  reason: string;
};

export type FullReportCSVType = {
  employeeCustomEntitlementTeamJobRoles: processedCustomAllocationType[];
  employeeLeaveEntitlementTeamJobRoles: processedLeaveEntitlements[];
  employeeLeaveRequestTeamJobRoleReports: processedLeaveRequests[];
};
