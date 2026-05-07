import { CrmModalTypes } from "./ModalTypes";

interface actionsTypes {
    setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
    setCrmModalType: (crmModalType: CrmModalTypes) => void;
}

export interface CrmStore extends actionsTypes {
    isAddCompanyModalOpen: boolean;
    crmModalType: CrmModalTypes;
}
