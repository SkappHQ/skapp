export interface LeaveTypesDropDownlistType {
  typeId?: number;
  name?: string;
  label: string;
  value: number;
  emoji?: string;
  duration?: string;
  color?: string | null;
}

export interface LeaveAllocationType {
  leaveTypeId: number;
  name: string;
  totalDaysAllocated: string;
  validFrom: string;
  validTo: string;
}

export interface LeaveEntitlementType {
  firstName: string;
  lastName: string;
  authPic: string;
  email: string;
  employeeId: number;
  entitlements: LeaveAllocationType[];
}

export interface LeaveEntitlementResponseType {
  currentPage: number;
  items: LeaveEntitlementType[];
  totalItems: number;
  totalPages: number;
}

export interface LeaveEntitlementBulkUploadType {
  email?: string;
  employeeEmail?: string;
  employeeId: number;
  employeeName: string;
  entitlements: LeaveAllocationType[];
}

export interface LeaveEntitlementParamsType {
  page: number;
  size: number;
  year: string;
  isExport: boolean;
  sortOrder: string;
  sortKey: string;
}

export interface LeaveEntitlementBulkPayloadType {
  year: string;
  entitlementDetailsList: LeaveEntitlementBulkUploadType[];
}

export interface LeaveEntitlementBalanceType {
  totalDaysUsed: number;
  totalDaysAllocated: number;
  validFrom: string;
  validTo: string;
}
