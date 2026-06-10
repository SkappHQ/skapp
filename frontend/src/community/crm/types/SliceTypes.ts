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

export interface CrmContactSidePanelSliceTypes extends Pick<
  CrmStore,
  | "isContactSidePanelOpen"
  | "setIsContactSidePanelOpen"
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
  "isSidePanelOpen" | "openSidePanel" | "closeSidePanel"
> {}
