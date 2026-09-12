import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmIndustryEnum,
  CrmPriorityEnum
} from "../enums/common";

export interface CrmCompanyEntity {
  id?: number;
  name?: string;
  industry?: CrmIndustryEnum;
  website?: string;
  address?: string;
  contactNumber?: string;
  metrics?: CrmCompanyMetrics;
  contactIds?: number[];
  dealIds?: number[];
  taskIds?: number[];
}

export interface CrmCompanyMetrics {
  id?: number;
  openTasksCount?: number;
  overdueTasksCount?: number;
  openValue?: string;
  accountValue?: string;
  openDealsCount?: number;
  closedDealsCount?: number;
}

export interface CrmContactEntity {
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  lastContactAt?: string;
  lastModifiedDate?: string;
  companyId?: number | null;
  companyName?: string;
  ownerId?: number;
  metrics?: CrmContactMetrics;
  dealIds?: number[];
  taskIds?: number[];
}

export interface CrmContactMetrics {
  id?: number;
  totalRevenue?: string;
  pipelineRevenue?: string;
  activeDealsCount?: number;
  openTasksCount?: number;
  overdueTasksCount?: number;
  closedDealValue?: string;
  closedDealCount?: number;
}

export interface CrmOwnerEntity {
  employeeId: number;
  firstName: string;
  lastName?: string;
  email?: string;
  authPic: string | null;
}

export interface CrmDealEntity {
  id?: number;
  name?: string;
  description?: string;
  priority?: CrmPriorityEnum;
  orderIndex?: string;
  amount?: string;
  closingAt?: string;
  stageId?: number;
  companyId?: number;
  contactId?: number;
  ownerId?: number;
  taskCount?: number;
  taskIds?: number[];
}

export interface CrmStageEntity {
  id?: number;
  name?: string;
  description?: string;
  color?: CrmDealStageColorsEnum;
  orderIndex?: number;
  stageType?: CrmDealStageEnum;
}

export interface CrmBoardColumn {
  dealIds: number[];
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
}

export interface CrmTaskEntity {
  id?: number;
  name?: string;
  priority?: CrmPriorityEnum;
  isCompleted?: boolean;
  dueAt?: string;
  notes?: string;
  typeId?: number;
  ownerId?: number;
  contactId?: number;
  companyId?: number;
  dealId?: number;
  relatedTaskIds?: number[];
}

export interface CrmTaskTypeEntity {
  id: number;
  name: string;
  orderIndex: number;
}

export type CrmCompanyRecord = Record<number, CrmCompanyEntity>;
export type CrmContactRecord = Record<number, CrmContactEntity>;
export type CrmOwnerRecord = Record<number, CrmOwnerEntity>;
export type CrmDealRecord = Record<number, CrmDealEntity>;
export type CrmStageRecord = Record<number, CrmStageEntity>;
export type CrmBoardRecord = Record<number, CrmBoardColumn>;
export type CrmTaskRecord = Record<number, CrmTaskEntity>;
export type CrmTaskTypeRecord = Record<number, CrmTaskTypeEntity>;
