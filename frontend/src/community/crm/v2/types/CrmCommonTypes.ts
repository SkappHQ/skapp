import { SortOrderTypes } from "~community/common/types/CommonTypes";

import { CrmDealSortEnum, CrmPriorityEnum } from "../enums/common";
import {
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity,
  CrmTaskEntity,
  CrmTaskTypeEntity
} from "./CrmTypes";

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

export interface CrmCompanyDomainSearchResponse {
  companies: CrmCompanyEntity[];
}

export interface CrmContactListResponse {
  items: CrmContactEntity[];
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

export interface CrmDealsByStagesResponse {
  stageId: number;
  deals: CrmDealEntity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface CrmTaskListResponse {
  tasks: CrmTaskEntity[];
}

export interface CrmTaskTypeListResponse {
  taskTypes: CrmTaskTypeEntity[];
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

export interface CrmExistsResponse {
  isExists: boolean;
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
