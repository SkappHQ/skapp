import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum, CrmDealStageEnum } from "../enums/common";

export interface CrmCompanyType {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  isDeleted: boolean;
}

export interface CrmOwnerType {
  employeeId: number;
  firstName: string;
  lastName: string | null;
  authPic: string | null;
}

export interface CrmContactType {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  lastContactAt: string | null;
  company: CrmCompanyType | null;
  owner: CrmOwnerType;
  isDeleted: boolean;
}

export interface CrmDealType {
  id: number;
  name: string;
  stage: CrmDealStageType;
  priority: string | null;
  closingAt: string | null;
  amount: string | null;
  currencyCode: string | null;
  company: CrmCompanyType | null;
  contact: CrmContactType;
  owner: CrmOwnerType;
  isDeleted: boolean;
}

export interface CrmDealStageType {
  id: number;
  name: string;
  color: string;
  orderIndex: number;
  stageType: CrmDealStageEnum;
}

export interface CrmTaskType {
  id: number;
  name: string;
  type: CrmTaskCategory;
  priority: string;
  isCompleted: boolean;
  dueAt: string | null;
  notes: string | null;
  owner: CrmOwnerType;
  contact: CrmContactType | null;
  company: CrmCompanyType | null;
  deal: CrmDealType | null;
  isDeleted: boolean;
}

export interface CrmTaskCategory {
  id: number;
  name: string;
  orderIndex: number;
}

export interface CrmDealCreateRequestType {
  name: string;
  stageId: number;
  contactId: number;
  ownerId: number;
  priority?: string;
  closingAt?: string;
  amount?: string;
  companyId?: number;
  description?: string;
}

export interface CrmDealListItemType {
  id: number;
  name: string;
  stageId: number;
  stageName: string;
  stageColor?: string;
  priority: string | null;
  closingAt: string | null;
  amount: string | null;
  companyId: number | null;
  companyName: string | null;
  contactId: number;
  contactName: string;
  ownerId: number;
  ownerName: string;
  openTaskCount?: number;
  overdueTaskCount?: number;
}

export interface CrmDealPaginatedResponseType {
  items: CrmDealListItemType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmDealFilterParams {
  page: number;
  size: number;
  sortOrder: SortOrderTypes;
  sortKey: CrmDealSortEnum;
  searchKeyword?: string;
  stageId?: number;
  priority?: string;
}
