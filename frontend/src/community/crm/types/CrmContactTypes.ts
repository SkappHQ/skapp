import { CrmContactType } from "./CommonTypes";

export type { CrmContactType };

export interface UpdateContactPayload {
  name?: string;
  email?: string;
  contactNumber?: string | null;
  companyId?: number | null;
  ownerId?: number | null;
}

export interface CrmContactsResponseType {
  items: CrmContactType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmSidePanelContactRow {
  id: string;
  name: string;
  company: string;
  email: string;
  contactNo: string;
  revenue: string;
  dealsClosed: number;
  openTasks: number;
  overdueTasks?: number;
}
