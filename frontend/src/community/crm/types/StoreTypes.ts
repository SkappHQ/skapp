import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
  setCrmModalType: (crmModalType: CrmModalTypes) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddContactModalOpen: boolean;
  crmModalType: CrmModalTypes;
}
