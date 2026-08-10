import { SortOrderTypes } from "~community/common/types/CommonTypes";

import {
  CrmDealSortEnum,
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmIndustryEnum,
  CrmPriorityEnum
} from "../enums/common";

// Company

export interface CompanyEntity {
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

export interface CompanyMetrics {
  id?: number;
  openTasksCount?: number;
  overdue?: number;
  openValue?: string;
  accountValue?: string;
  openDeals?: number;
  closedDeals?: number;
}

export interface CompanyLookup {
  id: number;
  name: string;
}

export interface CompanyDomainSearchResponseType {
  companies: CompanyEntity[];
}

// Contact

export interface ContactEntity {
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

export interface ContactMetrics {
  id?: number;
  totalRevenue?: string;
  pipelineRevenue?: string;
  activeDealsCount?: number;
  openTasksCount?: number;
  overdueTasksCount?: number;
  closedDealValue?: string;
  closedDealCount?: number;
}

export interface ContactLookup {
  id: number;
  firstName: string;
  lastName?: string;
  company?: CompanyLookup;
}

export interface Owner {
  employeeId: number;
  firstName: string;
  lastName?: string;
  authPic?: string;
}

// Deal

export interface DealEntity {
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

export interface DealLookup {
  id: number;
  name: string;
}

// Board

export interface BoardColumn {
  dealIds: number[];
  totalCount: number;
  page: number;
  hasNextPage: boolean;
}

export interface DealMoveResult {
  dealId: number;
  stageId: number;
  orderIndex: string;
  previousDealId?: number;
  nextDealId?: number;
}

// Deal Stage

export interface DealStageEntity {
  id?: number;
  name?: string;
  description?: string;
  color?: CrmDealStageColorsEnum;
  orderIndex?: number;
  stageType?: CrmDealStageEnum;
}

export interface DealStageReorderItem {
  id: number;
  orderIndex: number;
}

// Task

export interface TaskEntity {
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

export interface TaskType {
  id: number;
  name: string;
  orderIndex: number;
}

// Filters

export interface CompanyDomainSearchFilterRequest {
  domain: string;
  limit: number;
}

export interface ContactLookupFilterRequest {
  searchKeyword?: string;
  dealId?: number;
  page: number;
  size: number;
}

export interface DealFilterRequest {
  sortOrder?: SortOrderTypes;
  sortKey?: CrmDealSortEnum;
  searchKeyword?: string;
  stageId?: number;
  priority?: CrmPriorityEnum;
  companyId?: number;
  contactId?: number;
  page: number;
  size: number;
}

export interface DealsByStagesRequest {
  stageIds: number[];
  searchKeyword?: string;
  page: number;
  limit: number;
}

export interface TaskFilterRequest {
  searchKeyword?: string;
  contactId?: number;
  dealId?: number;
  companyId?: number;
}

export interface TaskCompletedFilterRequest {
  searchKeyword?: string;
  contactId?: number;
  dealId?: number;
  companyId?: number;
  page: number;
  size: number;
}

export interface TaskRelatedFilterRequest {
  contactId?: number;
  dealId?: number;
  page: number;
  size: number;
}
