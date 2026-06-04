import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum, CrmDealStageEnum, CrmPriorityEnum, CrmIndustryEnum} from "../enums/common";

export interface CrmOwner {
  employeeId: number;
  firstName: string;
  lastName: string | null;
  authPic: string | null;
}

export interface CrmCompanyType {
  id: number;
  name: string;
  industry: CrmIndustryEnum;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  isDeleted: boolean;
}

export interface CrmCompanyMetricsType {
  id: number;
  name: string;
  contactNumber: string;
  industry: CrmIndustryEnum;
  website: string | null;
  address: string | null;
  tasks: number;
  overdue: number;
  openValue: number;
  accountValue: number;
  closedDeals: number;
  openDeals: number;
}

export interface CrmCompanyMetricsResponseType {
  items: CrmCompanyMetricsType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmCompanyAddFormTypes {
  name: string;
  industry: CrmIndustryEnum;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
}

export interface CrmCompanyCreatePayload {
  name: string;
  industry: CrmIndustryEnum;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
}

export interface CrmContactType {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  lastContactAt: string | null;
  lastModifiedDate: string;
  company: CrmCompanyType | null;
  owner: CrmOwner;
  isDeleted: boolean;
}

export interface CompanyLookup {
  id: number;
  name: string;
}

export interface CrmCompaniesResponseType {
  items: CompanyLookup[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmOwnersResponseType {
  items: CrmOwner[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmContactAddFormTypes {
  name: string;
  email: string;
  contactNumber: string | null;
  companyId: number | null;
  ownerId: number | null;
}

export interface CrmContactCreatePayload {
  name: string;
  email: string;
  contactNumber?: string;
  companyId?: number;
  ownerId?: number;
}

export interface CrmContactMetricsType {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  lastContactAt: string | null;
  company: CompanyLookup | null;
  owner: CrmOwner;
  closedDealValue: number;
  closedDealCount: number;
  openTaskCount: number;
  overdueTaskCount: number;
}

export interface CrmContactMetricsResponseType {
  items: CrmContactMetricsType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmDealType {
  id: number;
  name: string;
  stage: CrmDealStageType;
  priority: CrmPriorityEnum | null;
  closingAt: string | null;
  amount: string | null;
  currencyCode: string | null;
  company: CrmCompanyType | null;
  contact: CrmContactType;
  owner: CrmOwner;
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
  priority: CrmPriorityEnum;
  isCompleted: boolean;
  dueAt: string | null;
  notes: string | null;
  owner: CrmOwner;
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

export interface CrmDealListItem {
  id: number;
  name: string;
  stageName: string;
  stageColor: string;
  amount: string;
  companyName: string | null;
  contactName: string;
  owner: CrmOwner;
}

export interface CrmDealPaginatedResponse {
  items: CrmDealListItem[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CrmDealFilterParams {
  size: number;
  sortOrder: SortOrderTypes;
  sortKey: CrmDealSortEnum;
  searchKeyword?: string;
  stageId?: number;
  priority?: CrmPriorityEnum;
}
