import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isCompanyModalOpen"
  | "setIsCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
  | "isAddDealFormOpen"
  | "setIsAddDealFormOpen"
> {}

export interface CrmCompanyDetailPanelSliceTypes extends Pick<
  CrmStore,
  | "selectedCompany"
  | "setSelectedCompany"
  | "isCompanyDetailDrawerOpen"
  | "setIsCompanyDetailDrawerOpen"
> {}

export interface CrmDealModalSliceTypes extends Pick<
  CrmStore,
  | "isDealModalOpen"
  | "setIsDealModalOpen"
  | "dealModalType"
  | "setDealModalType"
  | "currentDeletingDeal"
  | "setCurrentDeletingDeal"
> {}
