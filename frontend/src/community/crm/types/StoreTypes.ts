import { CrmCompanyType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedCompany: CrmCompanyType | null;
}
