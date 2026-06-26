import { EntitlementsDtoType } from "~community/common/types/BulkUploadTypes";

export interface EntitlementDetails {
  employeeId?: number;
  employeeName: string;
  email: string;
  name?: string;
  entitlements: EntitlementsDtoType[];
  employeeEmail?: string;
}

export interface EntitlementInfo {
  year?: string;
  entitlementDetails?: EntitlementDetails[];
  entitlementDetailsList?: EntitlementDetails[];
}
