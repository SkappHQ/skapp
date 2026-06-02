import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
}
