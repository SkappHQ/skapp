import { ReactElement } from "react";

import { SortOrderTypes } from "~community/common/types/CommonTypes";

import {
  CrmDealSortEnum,
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

export interface MetricChip {
  label: string;
  icon?: ReactElement;
  variant: CrmMetricLabelThemeEnum;
}

export interface MetricItem {
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

export interface CrmOwnersResponseType {
  items: CrmOwner[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmContactAddFormTypes {
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
  contactName: string;
  deal: string;
  owner: number | null;
  notes: string;
}

export interface CrmTaskCreatePayload {
  name: string;
  type: CrmTaskCategory | null;
  dueAt: string | null;
  priority: CrmPriorityEnum;
  contactName: string;
  deal: string;
  owner: number | null;
  notes: string;
}
