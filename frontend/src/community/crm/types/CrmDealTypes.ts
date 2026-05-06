import { CrmDealStageType } from "../enums/CrmDealEnums";
import { CrmCompanyType } from "./CrmCompanyTypes";
import { CrmContactType, CrmOwnerType } from "./CrmContactTypes";

export interface CrmPriorityType {
  id: number;
  name: string;
  orderIndex: number;
}

export interface CrmDealStageModel {
  id: number;
  name: string;
  color: string;
  orderIndex: number;
  stageType: CrmDealStageType;
}

export interface CrmDealType {
  id: number;
  name: string;
  stage: CrmDealStageModel;
  priority: CrmPriorityType | null;
  closingAt: string | null;
  amount: string | null;
  currencyCode: string | null;
  company: CrmCompanyType | null;
  contact: CrmContactType;
  owner: CrmOwnerType;
  isDeleted: boolean;
}

export interface CrmDealsResponseType {
  items: CrmDealType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
