import { CrmPriorityEnum } from "../enums/common";
import { CrmContactLookup, CrmDealStageType, CrmOwner } from "./CommonTypes";

export interface CrmBoardInitDataResponse {
  stages: CrmDealStageType[];
  contacts: CrmContactLookup[];
  owners: CrmOwner[];
  crmRoles: string[];
}

export interface CrmBoardDealResponseType {
  id: number;
  name: string;
  amount: string | null;
  ownerId: number;
  companyId: number | null;
  contactId: number;
  priority: CrmPriorityEnum;
  taskCount: number;
}

export interface CrmBoardDealType {
  id: number;
  name: string;
  contactName: string;
  companyName: string | null;
  owner: CrmOwner;
  amount: string | null;
  priority: CrmPriorityEnum;
  taskCount: number;
}

export interface CrmBoardStageDealsResponseType {
  stageId: number;
  deals: CrmBoardDealResponseType[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface CrmBoardStageDealsType {
  stageId: number;
  deals: CrmBoardDealSliceType[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface CrmBoardDealSliceType {
  id: number;
  name: string;
  contactName: string;
  companyName: string | null;
  owner: CrmOwner;
  amount: string | null;
  priority: CrmPriorityEnum;
  taskCount: number;
  stageId: number;
}

export interface CrmBoardDealsGroupedRequest {
  stageIds: number[];
  searchKeyword?: string;
  page: number;
  limit: number;
}

export interface CrmBoardDealNeighboursType {
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface CrmBoardReorderResultType extends CrmBoardDealNeighboursType {
  reorderedDeals: CrmBoardDealSliceType[];
}

export interface CrmBoardReorderWithinStagePayload
  extends CrmBoardDealNeighboursType {
  dealId: number;
}

export interface CrmBoardMoveBetweenStagesPayload
  extends CrmBoardDealNeighboursType {
  dealId: number;
  newStageId: number;
}

export interface KanbanDragData {
  type: "deal" | "stage";
  stageId: number;
}
