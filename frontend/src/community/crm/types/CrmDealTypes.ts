import { CrmDealStageEnum } from "../enums/CrmDealEnums";
import { CrmCompanyType } from "./CrmCompanyTypes";
import { CrmContactType, CrmOwnerType } from "./CrmContactTypes";

export interface CrmPriorityType {
  id: number;
  name: string;
  orderIndex: number;
}

export interface CrmDealStageType {
  id: number;
  name: string;
  color: string;
  orderIndex: number;
  stageType: CrmDealStageEnum;
}

export interface CrmDealType {
  id: number;
  name: string;
  stage: CrmDealStageType;
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
