import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "companyModalType"
  | "setCompanyModalType"
  | "selectedCompany"
  | "setSelectedCompany"
> {}
