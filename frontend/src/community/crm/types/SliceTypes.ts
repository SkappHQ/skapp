import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isCompanyModalOpen"
  | "setIsCompanyModalOpen"
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
