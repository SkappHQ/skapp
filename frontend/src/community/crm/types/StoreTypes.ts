import { CrmCompanyType, CrmContactMetricsType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyType | null) => void;
  openSidePanel: () => void;
  closeSidePanel: () => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setIsCompanySidePanelOpen: (isCompanySidePanelOpen: boolean) => void;
  setIsContactSidePanelOpen: (isContactSidePanelOpen: boolean) => void;
  setSelectedContact: (selectedContact: CrmContactMetricsType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  selectedCompany: CrmCompanyType | null;
  isSidePanelOpen: boolean;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  isCompanySidePanelOpen: boolean;
  isContactSidePanelOpen: boolean;
  selectedContact: CrmContactMetricsType | null;
}
