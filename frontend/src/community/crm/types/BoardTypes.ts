import { CrmPriorityEnum } from "../enums/common";
import {
  CrmContactLookup,
  CrmDealBoardType,
  CrmDealStageType,
  CrmOwner
} from "./CommonTypes";

export interface BoardInitDataResponse {
  stages: CrmDealStageType[];
  contacts: CrmContactLookup[];
  owners: CrmOwner[];
}

export interface BoardDealItem {
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

export interface BoardStageDeals {
  stageId: number;
  deals: BoardDealItem[];
  totalCount: number;
}

export interface BoardDealsGroupedRequest {
  stageIds: number[];
  searchKeyword?: string;
  page?: number | null;
  limit: number;
}

export interface BoardReorderWithinStagePayload {
  dealId: number;
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface BoardMoveBetweenStagesPayload {
  dealId: number;
  newStageId: number;
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface StageState {
  stageId: number;
  deals: CrmDealBoardType[];
  totalCount: number;
}

export type StageMap = StageState[];
