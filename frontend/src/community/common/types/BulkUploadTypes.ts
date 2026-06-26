export interface BulkStatusSummary {
  successCount: number;
  failedCount: number;
}

export interface EntitlementsDtoType {
  leaveTypeId: number;
  typeId?: number;
  name: string;
  totalDaysAllocated: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface BulkRecordErrorLogType {
  employeeId: number;
  employeeName: string;
  email: string;
  status: string;
  message: string;
  entitlementsDto?: EntitlementsDtoType[];
}

export interface BulkUploadResponse {
  bulkStatusSummary: BulkStatusSummary;
  bulkRecordErrorLogs: BulkRecordErrorLogType[];
}
