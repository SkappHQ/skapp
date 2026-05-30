import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsCompanySidePanelOpen: (isCompanySidePanelOpen: boolean) => void;
  setSelectedCompanyId: (selectedCompanyId: number | null) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isCompanySidePanelOpen: boolean;
  selectedCompanyId: number | null;
}
