import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isAddCompanyModalOpen"
  | "setIsAddCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
> {}

export interface CrmTaskModalSliceTypes extends Pick<
  CrmStore,
  | "isAddTaskModalOpen"
  | "setIsAddTaskModalOpen"
  | "taskModalType"
  | "setTaskModalType"
> {}
