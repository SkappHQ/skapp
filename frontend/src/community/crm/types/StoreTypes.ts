import { CrmCompanyMetricsType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setIsCompanySidePanelOpen: (isCompanySidePanelOpen: boolean) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  isCompanySidePanelOpen: boolean;
}
