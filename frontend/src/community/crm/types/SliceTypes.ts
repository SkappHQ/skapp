import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isAddCompanyModalOpen"
  | "setIsAddCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
> {}

export interface CrmContactsModalSliceTypes extends Pick<
  CrmStore,
  | "isAddContactModalOpen"
  | "setIsAddContactModalOpen"
  | "crmModalType"
  | "setCrmModalType"
> {}
