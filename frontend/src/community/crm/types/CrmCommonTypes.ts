import { SortOrderTypes } from "~community/common/types/CommonTypes";

import {
  CrmDealSortEnum,
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmIndustryEnum,
  CrmPriorityEnum
} from "../enums/common";

// Company

export interface CrmCompanyEntity {
  id?: number;
  name?: string;
  industry?: CrmIndustryEnum;
  website?: string;
  address?: string;
  contactNumber?: string;
  openTasksCount?: number;
  overdue?: number;
  openValue?: string;
  accountValue?: string;
  openDeals?: number;
  closedDeals?: number;
  contactIds?: number[];
  dealIds?: number[];
  taskIds?: number[];
}

export interface CrmCompanyMetrics {
  id?: number;
  openTasksCount?: number;
  overdue?: number;
  openValue?: string;
  accountValue?: string;
  openDeals?: number;
  closedDeals?: number;
}

export interface CrmCompanyLookup {
  id: number;
  name: string;
}

// Contact

export interface CrmContactEntity {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  lastContactAt?: string;
  lastModifiedDate?: string;
  companyId?: number;
  ownerId?: number;
  totalRevenue?: string;
  pipelineRevenue?: string;
  activeDealsCount?: number;
  openTasksCount?: number;
  overdueTasksCount?: number;
  closedDealValue?: string;
  closedDealCount?: number;
  dealIds?: number[];
  taskIds?: number[];
}

export interface CrmContactMetrics {
  id?: number;
  totalRevenue?: string;
  pipelineRevenue?: string;
  activeDealsCount?: number;
  openTasksCount?: number;
  overdueTasksCount?: number;
  closedDealValue?: string;
  closedDealCount?: number;
}

export interface CrmContactLookupItem {
  id: number;
  firstName: string;
  lastName?: string;
  company?: CrmCompanyLookup;
}

export interface CrmOwnerEntity {
  employeeId: number;
  firstName: string;
  lastName?: string;
  email?: string;
  authPic?: string;
}

// Deal

export interface CrmDealEntity {
  id?: number;
  name?: string;
  description?: string;
  priority?: CrmPriorityEnum;
  orderIndex?: string;
  amount?: string;
  closingAt?: string;
  stageId?: number;
  companyId?: number;
  contactId?: number;
  ownerId?: number;
  openTasksCount?: number;
  taskIds?: number[];
}

export interface CrmDealLookupItem {
  id: number;
  name: string;
}

export interface CrmDealStageEntity {
  id?: number;
  name?: string;
  description?: string;
  color?: CrmDealStageColorsEnum;
  orderIndex?: number;
  stageType?: CrmDealStageEnum;
}

export interface CrmBoardColumn {
  dealIds: number[];
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
}

// Task — entity and its type

export interface CrmTaskEntity {
  id?: number;
  name?: string;
  priority?: CrmPriorityEnum;
  isCompleted?: boolean;
  dueAt?: string;
  notes?: string;
  typeId?: number;
  ownerId?: number;
  contactId?: number;
  companyId?: number;
  dealId?: number;
}

export interface CrmTaskType {
  id: number;
  name: string;
  orderIndex: number;
}

// Requests
export interface CrmDealReorderWithinStageRequest {
  dealId: number;
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface CrmDealMoveBetweenStagesRequest {
  dealId: number;
  newStageId: number;
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface CrmDealStageReorderRequest {
  id: number;
  orderIndex: number;
}

// Responses
export interface CrmCompanyListResponse {
  items: CrmCompanyEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmCompanyLookupListResponse {
  items: CrmCompanyLookup[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmCompanyDomainSearchResponse {
  companies: CrmCompanyEntity[];
}

export interface CrmContactListResponse {
  items: CrmContactEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmContactLookupListResponse {
  items: CrmContactLookupItem[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmOwnerListResponse {
  items: CrmOwnerEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmDealListResponse {
  items: CrmDealEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmTaskListResponse {
  tasks: CrmTaskEntity[];
}

export interface CrmTaskTypeListResponse {
  taskTypes: CrmTaskType[];
}

export interface CrmTaskCompletedListResponse {
  items: CrmTaskEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmTaskRelatedListResponse {
  items: CrmTaskEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Filters

export interface CrmCompanyFilterRequest {
  searchKeyword?: string;
  page?: number;
  size?: number;
}

export interface CrmCompanyDomainSearchFilterRequest {
  domain: string;
  limit: number;
}

export interface CrmContactFilterRequest {
  searchKeyword?: string;
  companyId?: number;
  dealId?: number;
  page?: number;
  size?: number;
}

export interface CrmOwnerLookupFilterRequest {
  searchKeyword?: string;
  page?: number;
  size?: number;
}

export interface CrmDealFilterRequest {
  sortOrder?: SortOrderTypes;
  sortKey?: CrmDealSortEnum;
  searchKeyword?: string;
  stageId?: number;
  priority?: CrmPriorityEnum;
  companyId?: number;
  contactId?: number;
  page?: number;
  size?: number;
}

export interface CrmDealsByStagesRequest {
  stageIds: number[];
  searchKeyword?: string;
  page?: number;
  limit?: number;
}

export interface CrmTaskFilterRequest {
  searchKeyword?: string;
  contactId?: number;
  dealId?: number;
  companyId?: number;
}

export interface CrmTaskCompletedFilterRequest {
  searchKeyword?: string;
  contactId?: number;
  dealId?: number;
  companyId?: number;
  page?: number;
  size?: number;
}

export interface CrmTaskRelatedFilterRequest {
  contactId?: number;
  dealId?: number;
  page?: number;
  size?: number;
}
