import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isCompanyModalOpen"
  | "setIsCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
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
