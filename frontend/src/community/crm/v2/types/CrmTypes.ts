import { SortOrderTypes } from "~community/common/types/CommonTypes";

import { CrmDealSortEnum, CrmPriorityEnum } from "../enums/common";
import {
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskEntity,
  CrmTaskTypeEntity
} from "./CrmCommonTypes";

// Modals and side panels

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

// Batch-hydrate the companies referenced (by id) on loaded deals/board cards.
export interface CrmCompanyBatchRequest {
  ids: number[];
}

// Attached to each draggable card (`type: "deal"`) and each column droppable
// (`type: "stage"`) so the drag handlers can resolve the target stage/kind.
export interface CrmKanbanDragData {
  stageId: number;
  type: "stage" | "deal";
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

export interface CrmDealListResponse {
  items: CrmDealEntity[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Slim, scalar board card returned by /board/deals-grouped-by-stages. Unlike the
// v2 deal read it carries a `taskCount` (and no description/orderIndex/closingAt/
// stageId — the stage is implied by the group). Mapped to CrmDealEntity in
// boardUtil (taskCount -> openTasksCount, stageId stamped from the group).
export interface CrmBoardDealResponse {
  id: number;
  name: string;
  amount: string | null;
  ownerId: number;
  companyId: number | null;
  contactId: number;
  priority: CrmPriorityEnum;
  taskCount: number;
}

export interface CrmDealsByStagesResponse {
  stageId: number;
  deals: CrmBoardDealResponse[];
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

// Contact lookup (typeahead) item + paginated response.
export interface CrmContactLookupItem {
  id: number;
  name: string;
  company: CrmCompanyEntity | null;
}

export interface CrmContactLookupResponse {
  items: CrmContactLookupItem[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Formik shape for the add-deal form (scalar id fields are strings while the
// user is selecting; converted to numbers in the create payload).
export interface CrmDealAddFormTypes {
  name: string;
  stageId: string;
  contactId: string;
  ownerId: string;
  priority: CrmPriorityEnum;
  amount: string;
  description: string;
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
