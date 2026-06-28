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
  | "preselectedContact"
  | "setPreselectedContact"
  | "selectedTask"
  | "setSelectedTask"
> {}

export interface CrmSidePanelSliceTypes extends Pick<
  CrmStore,
  "isCrmSidePanelOpen" | "setIsCrmSidePanelOpen"
> {}

export interface CrmBoardSliceTypes extends Pick<
  CrmStore,
  | "boardStages"
  | "setBoardStages"
  | "boardContacts"
  | "setBoardContacts"
  | "boardOwners"
  | "setBoardOwners"
  | "boardCrmRoles"
  | "setBoardCrmRoles"
  | "boardStageDeals"
  | "setBoardStageDeals"
  | "appendBoardStageDeals"
> {}
