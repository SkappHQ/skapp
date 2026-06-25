import { ReactElement } from "react";

import { SortOrderTypes } from "~community/common/types/CommonTypes";

import {
  CrmDealSortEnum,
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmIndustryEnum,
  CrmMetricLabelThemeEnum,
  CrmPriorityEnum
} from "../enums/common";

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
  openValue: string;
  accountValue: string;
  closedDeals: number;
  openDeals: number;
}

export interface CrmCompanyMetricsResponseType {
  items: CrmCompanyMetricsType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface MetricChip {
  label: string;
  icon?: ReactElement;
  variant: CrmMetricLabelThemeEnum;
}

export interface MetricItem {
  id: string;
  title: string;
  amount: string;
  isCurrency?: boolean;
  chip?: MetricChip;
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

export interface EditCompanyPayload extends CrmCompanyCreatePayload {
  id: number;
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

export interface CrmContactLookup {
  id: number;
  name: string;
  company?: CompanyLookup | null;
}

export interface CrmCompaniesResponseType {
  items: CompanyLookup[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmContactLookupResponseType {
  items: CrmContactLookup[];
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

export interface CrmContactLookupResponseType {
  items: CrmContactLookup[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
export interface CrmCompanyDomainSearchResponseType {
  companies: CrmCompanyType[];
}

export interface CrmContactFormValues {
  name: string;
  email: string;
  contactNumber: string;
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

export interface EditContactPayload {
  id?: number;
  name?: string;
  email?: string;
  contactNumber?: string;
  companyId?: number | null;
  ownerId?: number | null;
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
  description: string | null;
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
  description?: string | null;
  color: CrmDealStageColorsEnum;
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

export interface CrmDealLookup {
  id: number;
  name: string;
}

export interface CrmTaskResponseType {
  tasks: CrmTaskDetailType[];
}

export interface CrmCompletedTaskResponseType {
  items: CrmTaskDetailType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmTaskDetailType {
  id: number;
  name: string;
  typeId: number;
  typeName: string;
  priority: CrmPriorityEnum;
  isCompleted: boolean;
  dueAt: string | null;
  notes: string | null;
  contactId: number | null;
  owner: CrmOwner;
  contact: CrmContactLookup | null;
  deal: DetailPanelDealResponseType | null;
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

export interface CrmDealAddFormTypes {
  name: string;
  stageId: string;
  contactId: string;
  ownerId: string;
  priority: CrmPriorityEnum;
  amount: string;
  description: string;
}

export interface CrmCreateDealPayload {
  name: string;
  stageId: number;
  contactId: number;
  ownerId: number;
  priority: CrmPriorityEnum;
  description?: string | null;
  amount?: string | null;
  closingAt?: string | null;
}

export interface CrmCompanyEditFormTypes {
  name: string;
  industry: CrmIndustryEnum;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
}

export interface CrmTaskAddFormTypes {
  name: string;
  type: CrmTaskCategory | null;
  dueDate: string | null;
  priority: CrmPriorityEnum;
  contactId: number | null;
  dealId: number | null;
  owner: number | null;
  notes: string;
}

export interface CrmTaskCreatePayload {
  name: string;
  typeId?: number;
  dueAt: string | null;
  priority: CrmPriorityEnum;
  contactId?: number;
  dealId?: number;
  ownerId?: number;
  notes: string;
}

export interface UpdateTaskStatusPayload {
  id: number;
  isCompleted: boolean;
}

export interface TaskRowResponseType {
  id: number;
  name: string;
  type: string;
  priority: CrmPriorityEnum;
  isCompleted: boolean;
  dueAt: string | null;
  owner: CrmOwner;
  contact: CrmContactLookup | null;
}

export interface DetailPanelDealResponseType {
  id: number;
  name: string;
  description: string | null;
  amount: string;
  owner: CrmOwner;
  stage: CrmDealStageType;
}

export interface CrmDealDetailResponseType {
  id: number;
  name: string;
  description: string | null;
  amount: string | null;
  owner: CrmOwner;
  stage: CrmDealStageType;
  priority: CrmPriorityEnum;
  contact: CrmContactLookup;
}

export interface CrmContactDetailResponseType {
  id: number;
  name: string;
  email: string;
  contactNumber: string;
  lastModifiedDate: string;
  company: CompanyLookup | null;
  owner: CrmOwner;
  openTasksCount: number;
  overdueTasksCount: number;
  activeDealsCount: number;
  totalRevenue: string;
  pipelineRevenue: string;
  tasks: TaskRowResponseType[];
  deals: DetailPanelDealResponseType[];
}
