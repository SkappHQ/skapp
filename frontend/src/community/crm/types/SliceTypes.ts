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
  | "removeCompany"
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
  | "updateContactTaskCompletion"
  | "removeContact"
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
  | "removeDeal"
> {}

export interface CrmBoardSliceTypes extends Pick<
  CrmStore,
  | "boardStageDeals"
  | "setBoardStageDeals"
  | "appendBoardStageDeals"
  | "replaceBoardStageDeals"
  | "addDealToStage"
  | "updateDealInStage"
  | "removeDealFromStage"
  | "preselectedStageId"
  | "setPreselectedStageId"
> {}
