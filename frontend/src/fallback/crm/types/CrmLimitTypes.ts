export enum CrmLimitResource {
  CONTACTS = "contacts",
  COMPANIES = "companies",
  DEALS = "deals",
  DEAL_STAGES = "dealStages",
  TASKS = "tasks"
}

export interface CrmLimitItem {
  allocatedCount: number;
  usedCount: number;
  remainingCount: number;
  unlimited: boolean;
  limitReached: boolean;
}

export type CrmLimitationResponse = Record<CrmLimitResource, CrmLimitItem>;
