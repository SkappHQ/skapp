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

export interface CrmCompanySidePanelSliceTypes extends Pick<
  CrmStore,
  | "isCompanySidePanelOpen"
  | "setIsCompanySidePanelOpen"
> {}
