import { CrmStore } from "./StoreTypes";

export interface CrmCompanySliceTypes extends Pick<
  CrmStore,
  | "isCompanyModalOpen"
  | "setIsCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
  | "selectedCompany"
  | "setSelectedCompany"
> {}

export interface CrmContactSliceTypes extends Pick<
  CrmStore,
  | "isAddContactModalOpen"
  | "setIsAddContactModalOpen"
  | "contactModalType"
  | "setContactModalType"
  | "selectedContactId"
  | "setSelectedContactId"
> {}

export interface CrmTaskSliceTypes extends Pick<
  CrmStore,
  | "isTaskModalOpen"
  | "setIsTaskModalOpen"
  | "taskModalType"
  | "setTaskModalType"
  | "selectedTaskId"
  | "setSelectedTaskId"
> {}

export interface CrmSidePanelSliceTypes extends Pick<
  CrmStore,
  "isCrmSidePanelOpen" | "setIsCrmSidePanelOpen"
> {}
