import { CrmStore } from "./CrmStoreTypes";

export interface crmCompanyModalSliceTypes
    extends Pick<
        CrmStore,
        | "isAddCompanyModalOpen"
        | "setIsAddCompanyModalOpen"
        | "companyModalType"
        | "setCompanyModalType"
    > { }