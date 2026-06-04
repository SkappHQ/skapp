import { CrmContactType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsContactModalOpen: (isContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedContact: (selectedContact: CrmContactType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedContact: CrmContactType | null;
}
