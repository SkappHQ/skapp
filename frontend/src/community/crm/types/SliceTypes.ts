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

export interface CrmSidePanelSliceTypes extends Pick<
  CrmStore,
  | "isSidePanelOpen"
  | "openSidePanel"
  | "closeSidePanel"
> {}
