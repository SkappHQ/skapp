import { CrmStore } from "./StoreTypes";

export interface CrmCompanyModalSliceTypes extends Pick<
  CrmStore,
  | "isAddCompanyModalOpen"
  | "setIsAddCompanyModalOpen"
  | "companyModalType"
  | "setCompanyModalType"
> {}

export interface CrmContactDetailSliceTypes extends Pick<
  CrmStore,
  | "isContactDetailPanelOpen"
  | "selectedContactId"
  | "openContactDetailPanel"
  | "closeContactDetailPanel"
> {}
