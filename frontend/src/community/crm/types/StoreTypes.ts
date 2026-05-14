import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddDealSidePanelOpen: (isOpen: boolean) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddDealSidePanelOpen: boolean;
}
