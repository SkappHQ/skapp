import { JSX } from "react";

import { CrmDealStageEnum, CrmMetricChipThemeEnum } from "../enums/common";

export interface MetricChipProps {
  label: string;
  theme: CrmMetricChipThemeEnum;
  icon?: React.ReactNode;
}

export interface MetricItem {
  title: string;
  amount: string | number;
  isCurrency?: boolean;
  chip?: MetricChipProps;
}

export interface CrmCompanyType {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  isDeleted: boolean;
}

export interface CrmCompanyMetricsType {
  id: number;
  name: string;
  contactNumber: string;
  industry: string | null;
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
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
}

export interface CrmCompanyCreatePayload {
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
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
  priority: CrmPriorityType | null;
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
  priority: CrmPriorityType;
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

export interface CrmPriorityType {
  id: number;
  name: string;
  orderIndex: number;
}
