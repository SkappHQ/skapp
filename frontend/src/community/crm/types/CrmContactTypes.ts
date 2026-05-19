import { CrmCompanyType } from "./CommonTypes";

export interface CrmOwnerType {
  employeeId: number;
  firstName: string;
  lastName: string | null;
  authPic: string | null;
}

export interface CrmContactType {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  lastContactAt: string | null;
  company: CrmCompanyType | null;
  owner: CrmOwnerType;
  isDeleted: boolean;
}

export interface CrmContactsResponseType {
  items: CrmContactType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmContactMetricsType {
  totalRevenue: number;
  revenueOnPipeline: number;
  activeDealsCount: number;
  openTasksCount: number;
  overdueTasksCount: number;
}

export interface UpdateContactPayload {
  name: string;
  email: string;
  contactNumber: string | null;
}
