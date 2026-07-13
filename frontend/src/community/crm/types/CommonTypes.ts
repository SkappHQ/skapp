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

export interface CrmCompany {
  id: number;
  name: string;
  industry: CrmIndustryEnum;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  openTasksCount: number | null;
  overdue: number | null;
  openValue: string | null;
  accountValue: string | null;
  closedDeals: number | null;
  openDeals: number | null;
  tasks: CrmTaskDetailType[] | null;
  deals: CrmDealListItem[] | null;
  contacts: CrmContact[] | null;
}

export interface CrmCompanyMetricsResponseType {
  items: CrmCompany[];
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

export interface CrmContactMetricsResponseType {
  items: CrmContact[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmDealType {
  id: number;
  name: string;
  description: string | null;
  stage: CrmDealStageType;
  priority: CrmPriorityEnum;
  closingAt: string | null;
  amount: string | null;
  currencyCode: string | null;
  company: CrmCompanyType | null;
  contact: CrmContactType;
  owner: CrmOwner;
  isDeleted: boolean;
}

export interface CrmDealResponseType {
  id: number;
  name: string;
  description: string | null;
  stage: CrmDealStageType;
  priority: CrmPriorityEnum;
  orderIndex: string;
  amount: string | null;
  companyName: string | null;
  contactId: number | null;
  contactName: string | null;
  owner: CrmOwner;
}

export interface CrmDealStageType {
  id: number;
  name: string;
  description?: string | null;
  color: CrmDealStageColorsEnum;
  orderIndex: number;
  stageType: CrmDealStageEnum;
}

export interface CrmDealStageFormTypes {
  name: string;
  description: string;
  color: CrmDealStageColorsEnum;
}

export interface CrmDealStageCreatePayload {
  name: string;
  description: string | null;
  color: CrmDealStageColorsEnum;
}

export interface CrmDealStageUpdatePayload extends Partial<CrmDealStageCreatePayload> {
  id: number;
}

export interface CrmDealStageReorderItem {
  id: number;
  orderIndex: number;
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

export interface CrmTaskCategoryResponseType {
  taskTypes: CrmTaskCategory[];
}

export interface CrmDealListItem {
  id: number;
  name: string;
  stage: CrmDealStageType;
  amount: string;
  companyName: string | null;
  contactName: string;
  owner: CrmOwner;
  description: string | null;
}

export interface CrmDealEditPayload {
  id: number;
  name?: string;
  description?: string | null;
  stageId?: number;
  priority?: CrmPriorityEnum;
  amount?: string | null;
  contactId?: number;
  ownerId?: number;
}

export interface CrmDealPaginatedResponse {
  items: CrmDealResponseType[];
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

export interface RelatedTasksParams {
  contactId?: number | null;
  dealId?: number | null;
  size: number;
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

export interface CrmInlineDealAddFormTypes {
  name: string;
  contactId: string;
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

export interface CrmDealNameExistsResponse {
  isExists: boolean;
}

export interface CrmCompanyEditFormTypes {
  name: string;
  industry: CrmIndustryEnum;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
}

export interface CrmTaskFormTypes {
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

export interface CrmTaskUpdatePayload {
  id: number;
  name?: string;
  typeId?: number;
  dueAt?: string | null;
  priority?: CrmPriorityEnum;
  contactId?: number | null;
  dealId?: number | null;
  ownerId?: number | null;
  notes?: string;
  isCompleted?: boolean;
}

export interface TaskRowResponseType {
  id: number;
  name: string;
  typeName: string;
  priority: CrmPriorityEnum;
  isCompleted: boolean;
  dueAt: string | null;
  owner: CrmOwner;
  contact: CrmContactLookup | null;
  deal: CrmDealLookup | null;
}

export interface DetailPanelDealResponseType {
  id: number;
  name: string;
  description: string | null;
  amount: string;
  owner: CrmOwner;
  stage: CrmDealStageType;
}

export interface CrmContact {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  company: CompanyLookup | null;
  owner: CrmOwner;
  lastContactAt: string | null;
  lastModifiedDate: string | null;
  closedDealValue: number | null;
  closedDealCount: number | null;
  openTasksCount: number | null;
  overdueTasksCount: number | null;
  totalRevenue: string | null;
  pipelineRevenue: string | null;
  activeDealsCount: number | null;
  tasks: TaskRowResponseType[] | null;
  deals: DetailPanelDealResponseType[] | null;
}

export interface RelatedTasksPage {
  items: TaskRowResponseType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
