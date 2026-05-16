import { CrmCompanyType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsCompanyDetailDrawerOpen: (isOpen: boolean) => void;
  setSelectedCompany: (company: CrmCompanyType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isCompanyDetailDrawerOpen: boolean;
  selectedCompany: CrmCompanyType | null;
}
