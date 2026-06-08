import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isCompanyModalOpen"
  | "setIsCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
> {}

export interface CrmCompanySidePanelSliceTypes extends Pick<
  CrmStore,
  | "isCompanySidePanelOpen"
  | "setIsCompanySidePanelOpen"
  | "selectedCompany"
  | "setSelectedCompany"
> {}

export interface CrmContactModalSliceTypes extends Pick<
  CrmStore,
  | "isAddContactModalOpen"
  | "setIsAddContactModalOpen"
  | "contactModalType"
  | "setContactModalType"
> {}

export interface CrmTaskModalSliceTypes extends Pick<
  CrmStore,
  | "isTaskModalOpen"
  | "setIsTaskModalOpen"
  | "taskModalType"
  | "setTaskModalType"
> {}
