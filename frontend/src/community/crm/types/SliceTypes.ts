import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isAddCompanyModalOpen"
  | "setIsAddCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
> {}

export interface CrmAddDealSidePanelSliceTypes extends Pick<
  CrmStore,
  | "isAddDealSidePanelOpen"
  | "setIsAddDealSidePanelOpen"
> {}

