import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isAddCompanyModalOpen"
  | "setIsAddCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
> {}

export interface CrmCompanySidePanelSliceTypes extends Pick<
  CrmStore,
  | "isCompanySidePanelOpen"
  | "setIsCompanySidePanelOpen"
  | "selectedCompanyId"
  | "setSelectedCompanyId"
> {}
