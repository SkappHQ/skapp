import { CrmPriorityEnum } from "../enums/common";
import { CrmContactLookup, CrmDealStageType, CrmOwner } from "./CommonTypes";

export interface CrmBoardInitDataResponse {
  stages: CrmDealStageType[];
  contacts: CrmContactLookup[];
  owners: CrmOwner[];
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
  orderIndex: string;
}

export interface CrmBoardStageDeals {
  stageId: number;
  deals: CrmBoardDealType[];
  totalCount: number;
}

export interface CrmBoardDealsGroupedRequest {
  stageIds: number[];
  searchKeyword?: string;
  page: number;
  limit: number;
}

export interface CrmBoardReorderWithinStagePayload {
  dealId: number;
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface CrmBoardMoveBetweenStagesPayload {
  dealId: number;
  newStageId: number;
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface CrmBoardStage {
  stageId: number;
  deals: CrmBoardDealType[];
}
