import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isAddCompanyModalOpen"
  | "setIsAddCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
> {}

export interface CrmCompanyDetailPanelSliceTypes extends Pick<
  CrmStore,
  | "selectedCompany"
  | "setSelectedCompany"
  | "isCompanyDetailDrawerOpen"
  | "setIsCompanyDetailDrawerOpen"
> {}
