import { CrmModalTypes } from "./ModalTypes";
import { CrmCompanyMetricsType } from "./CommonTypes";

interface ActionTypes {
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
}

export interface CrmStore extends ActionTypes {
  companyModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isCompanyModalOpen: boolean;
}
