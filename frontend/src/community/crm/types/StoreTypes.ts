import { CrmCompanyMetricsType, CrmContactMetricsType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setIsCompanySidePanelOpen: (isCompanySidePanelOpen: boolean) => void;
  setIsContactSidePanelOpen: (isContactSidePanelOpen: boolean) => void;
  setSelectedContact: (selectedContact: CrmContactMetricsType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  isCompanySidePanelOpen: boolean;
  isContactSidePanelOpen: boolean;
  selectedContact: CrmContactMetricsType | null;
}
