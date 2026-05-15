import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isAddCompanyModalOpen"
  | "setIsAddCompanyModalOpen"
  | "isDeleteCompanyModalOpen"
  | "setIsDeleteCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
  | "selectedCompany"
  | "setSelectedCompany"
  | "isCompanyDetailDrawerOpen"
  | "setIsCompanyDetailDrawerOpen"
> {}
