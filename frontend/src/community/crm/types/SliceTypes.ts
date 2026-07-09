import { CrmStore } from "./StoreTypes";

export interface CrmCompanySliceTypes extends Pick<
  CrmStore,
  | "isCompanyModalOpen"
  | "setIsCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
  | "selectedCompanyId"
  | "setSelectedCompanyId"
  | "companies"
  | "setCompanies"
  | "updateCompany"
  | "getCompanyById"
> {}

export interface CrmContactSliceTypes extends Pick<
  CrmStore,
  | "isContactModalOpen"
  | "setIsContactModalOpen"
  | "contactModalType"
  | "setContactModalType"
  | "selectedContactId"
  | "setSelectedContactId"
  | "contacts"
  | "setContacts"
  | "updateContact"
  | "getContactById"
> {}

export interface CrmTaskSliceTypes extends Pick<
  CrmStore,
  | "isTaskModalOpen"
  | "setIsTaskModalOpen"
  | "taskModalType"
  | "setTaskModalType"
  | "selectedTaskId"
  | "setSelectedTaskId"
  | "tasks"
  | "setTasks"
  | "getTaskById"
  | "updateTask"
> {}

export interface CrmDealSliceTypes extends Pick<
  CrmStore,
  | "selectedDealId"
  | "setSelectedDealId"
  | "deals"
  | "setDeals"
  | "getDealById"
  | "updateDeal"
> {}

export interface CrmBoardSliceTypes extends Pick<
  CrmStore,
  | "boardStageDeals"
  | "setBoardStageDeals"
  | "appendBoardStageDeals"
  | "addDealToStage"
  | "updateDealInStage"
  | "preselectedStageId"
  | "setPreselectedStageId"
> {}
