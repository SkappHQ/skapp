import { CrmCompanyType } from "./CrmCompanyTypes";
import { CrmContactType, CrmOwnerType } from "./CrmContactTypes";
import { CrmDealType, CrmPriorityType } from "./CrmDealTypes";

export interface CrmTaskTypeModel {
  id: number;
  name: string;
  orderIndex: number;
}

export interface CrmTaskType {
  id: number;
  name: string;
  type: CrmTaskTypeModel;
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

export interface CrmTasksResponseType {
  items: CrmTaskType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
