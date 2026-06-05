import { CrmCompanyType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  selectedCompany: CrmCompanyType | null;
}
