import { CrmDealStageEnum } from "../enums/common";

// Pagination
export interface PaginatedResponseType<T> {
  items: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Company Types
export interface CompanyLookup {
  id: number;
  name: string;
}

export interface CrmCompanyType {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  isDeleted: boolean;
}

// Owner Types
export interface ContactOwner {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  authPic: string | null;
  crmRole: "CRM_ADMIN" | "CRM_SALES_MANAGER" | "CRM_SALES_REPRESENTATIVE";
}

export interface CrmOwnerType {
  employeeId: number;
  firstName: string;
  lastName: string | null;
  authPic: string | null;
}

// Contact Types
export interface ContactListItem {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  lastContactedAt: string | null;
  lastModifiedDate: string;
  company: CompanyLookup | null;
  owner: ContactOwner;
  closedDealValue: number;
  closedDealCount: number;
  pipelineDealValue: number;
  activeDealCount: number;
  openTaskCount: number;
  overdueTaskCount: number;
}

export interface ContactDetail {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  lastContactedAt: string | null;
  lastModifiedDate: string;
  company: CompanyLookup | null;
  owner: ContactOwner;
}

export interface ContactMetrics {
  totalRevenue: number;
  revenueOnPipeline: number;
  activeDealCount: number;
  openTaskCount: number;
  overdueTaskCount: number;
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

// Deal Types
export interface DealStage {
  id: number;
  name: string;
}

export interface CrmDealStageType {
  id: number;
  name: string;
  color: string;
  orderIndex: number;
  stageType: CrmDealStageEnum;
}

// export interface ContactDeal {
//   id: number;
//   name: string;
//   amount: string;
//   closingAt: string | null;
//   stage: DealStage;
//   priority: Priority | null;
//   owner: ContactOwner;
//   company: CompanyLookup | null;
// }


export interface ContactDeal {
  id: number;
  name: string;
  stage: CrmDealStageType;
  priority: CrmPriorityType | null;
  closingAt: string | null;
  amount: string | null;
  currencyCode: string | null;
  notes: string | null;
  company: CrmCompanyType | null;
  contact: CrmContactType;
  owner: CrmOwnerType;
  isDeleted: boolean;
}
export type ContactDealType = ContactDeal;
export type CrmDealType = ContactDeal;

// Task Types
export interface TaskType {
  id: number;
  name: string;
}

export interface CrmTaskCategory {
  id: number;
  name: string;
  orderIndex: number;
}

export interface ContactTask {
  id: number;
  name: string;
  isCompleted: boolean;
  dueAt: string | null;
  notes: string | null;
  type: TaskType;
  priority: Priority;
  owner: ContactOwner;
}

export interface CrmTaskType {
  id: number;
  name: string;
  type: CrmTaskCategory;
  priority: CrmPriorityType;
  isCompleted: boolean;
  dueAt: string | null;
  notes: string | null;
  owner: CrmOwnerType;
  contact: CrmContactType | null;
  company: CrmCompanyType | null;
  deal: CrmDealType | null;
  isDeleted: boolean;
}

// Priority Types
export interface Priority {
  id: number;
  name: string;
}

export interface CrmPriorityType {
  id: number;
  name: string;
  orderIndex: number;
}

// Contact Metrics (side-panel view — from /contacts/{id}/metrics endpoint)
export interface CrmContactMetricsType {
  totalRevenue: number;
  revenueOnPipeline: number;
  activeDealsCount: number;
  openTasksCount: number;
  overdueTasksCount: number;
}

// API Response Types
export interface CrmContactsListResponseType extends PaginatedResponseType<ContactListItem> {}
export interface CrmOwnersResponseType extends PaginatedResponseType<ContactOwner> {}
export interface CrmCompaniesResponseType extends PaginatedResponseType<CompanyLookup> {}

// Request Params Types
export interface ContactsListParams {
  page?: number;
  size?: number;
  sortKey?: "NAME" | "EMAIL" | "CREATED_DATE" | "DEAL_VALUE";
  sortOrder?: "ASC" | "DESC";
  searchKeyword?: string;
  companyIds?: string;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  contactNumber?: string;
  companyId?: number;
  ownerId?: number;
}

export interface UpdateContactPayload {
  name: string;
  email: string;
  contactNumber?: string | null;
  companyId?: number | null;
  ownerId?: number;
}
