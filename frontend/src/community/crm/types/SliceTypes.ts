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
  | "isContactModalOpen"
  | "setIsContactModalOpen"
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
  | "selectedTaskId"
  | "setSelectedTaskId"
  | "tasks"
  | "setTasks"
  | "getTaskById"
> {}

export interface CrmSidePanelSliceTypes extends Pick<
  CrmStore,
  | "isCrmSidePanelOpen"
  | "setIsCrmSidePanelOpen"
  | "preselectedStageId"
  | "setPreselectedStageId"
> {}

export interface CrmBoardSliceTypes extends Pick<
  CrmStore,
  | "boardStageDeals"
  | "setBoardStageDeals"
  | "appendBoardStageDeals"
  | "addDealToStage"
> {}
