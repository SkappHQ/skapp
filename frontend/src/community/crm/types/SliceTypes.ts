import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isCompanyModalOpen"
  | "setIsCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
  | "selectedCompany"
  | "setSelectedCompany"
> {}

export interface CrmContactModalSliceTypes extends Pick<
  CrmStore,
  | "isAddContactModalOpen"
  | "setIsAddContactModalOpen"
  | "contactModalType"
  | "setContactModalType"
  | "selectedContact"
  | "setSelectedContact"
> {}

export interface CrmTaskModalSliceTypes extends Pick<
  CrmStore,
  | "isTaskModalOpen"
  | "setIsTaskModalOpen"
  | "taskModalType"
  | "setTaskModalType"
> {}

export interface CrmSidePanelSliceTypes extends Pick<
  CrmStore,
  "isCrmSidePanelOpen" | "setIsCrmSidePanelOpen"
> {}
