import { ReactNode } from "react";

import { SortOrderTypes } from "~community/common/types/CommonTypes";

import {
  CrmDealSortEnum,
  CrmKanbanDragType,
  CrmPriorityEnum,
  CrmTaskSortEnum,
  CrmTaskTabEnum
} from "../enums/common";
import {
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskEntity,
  CrmTaskTypeEntity
} from "./CrmCommonTypes";

export enum CrmModalTypes {
  ADD_COMPANY_MODAL = "ADD_COMPANY_MODAL",
  ADD_CONTACT_MODAL = "ADD_CONTACT_MODAL",
  EDIT_COMPANY_MODAL = "EDIT_COMPANY_MODAL",
  EDIT_CONTACT_MODAL = "EDIT_CONTACT_MODAL",
  ADD_TASK_MODAL = "ADD_TASK_MODAL",
  EDIT_TASK_MODAL = "EDIT_TASK_MODAL",
  DELETE_COMPANY_MODAL = "DELETE_COMPANY_MODAL",
  DELETE_CONTACT_MODAL = "DELETE_CONTACT_MODAL",
  ADD_DEAL_STAGE_MODAL = "ADD_DEAL_STAGE_MODAL",
  EDIT_DEAL_STAGE_MODAL = "EDIT_DEAL_STAGE_MODAL",
  DELETE_DEAL_STAGE_MODAL = "DELETE_DEAL_STAGE_MODAL",
  DELETE_TASK_MODAL = "DELETE_TASK_MODAL"
}

export enum CrmSidePanelTypes {
  CONTACT_SIDE_PANEL = "CONTACT_SIDE_PANEL",
  COMPANY_SIDE_PANEL = "COMPANY_SIDE_PANEL",
  TASK_SIDE_PANEL = "TASK_SIDE_PANEL",
  ADD_DEAL_SIDE_PANEL = "ADD_DEAL_SIDE_PANEL",
  DEAL_DETAIL_SIDE_PANEL = "DEAL_DETAIL_SIDE_PANEL"
}

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

export interface CrmDealStageReorderItem {
  id: number;
  orderIndex: number;
}

export interface CrmCompanyBatchRequest {
  ids: number[];
}

export interface CrmKanbanDragData {
  stageId: number;
  type: CrmKanbanDragType;
}

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

export interface CrmBoardInitDataResponse {
  stages: CrmStageEntity[];
  contacts: CrmContactEntity[];
  owners: CrmOwnerEntity[];
  taskTypes: CrmTaskTypeEntity[];
}

export interface CrmOwnerListResponse {
  items: CrmOwnerEntity[];
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

export interface CrmDealListResponse {
  items: CrmDealEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmTaskListResponse {
  items: CrmTaskEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmTaskTypeListResponse {
  taskTypes: CrmTaskTypeEntity[];
}

export interface CrmExistsResponse {
  isExists: boolean;
}

export interface CrmContactLookupResponse {
  items: CrmContactEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

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

export interface TaskDueDateInfo {
  textKey: string;
  dateValue?: string;
  dayCount?: number;
  textColorClass: string;
}

export interface GroupedTaskIds {
  overdue: number[];
  dueToday: number[];
  dueTomorrow: number[];
  upcoming: number[];
  isOpenTasksEmpty: boolean;
}

export interface CrmPriorityOption {
  id: string;
  value: string;
  label: ReactNode;
}

export interface CrmTaskTypeOption {
  id: string;
  value: string;
  label: string;
}

export interface CrmTaskTab {
  id: CrmTaskTabEnum;
  label: string;
}

export interface CrmTaskFilterRequest {
  searchKeyword?: string;
  contactId?: number;
  dealId?: number;
  companyId?: number;
  isCompleted?: boolean;
  sortKey?: CrmTaskSortEnum;
  sortOrder?: SortOrderTypes;
  page?: number;
  size?: number;
}

export interface CrmRelatedTasksFilterRequest {
  id: number;
  page?: number;
  size?: number;
}

export interface CrmTaskUpdateRequest {
  id: number;
  task: CrmTaskEntity;
}

export interface CrmContactUpdateRequest {
  id: number;
  contact: CrmContactEntity;
}
