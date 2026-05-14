import { CrmModalTypes } from "./ModalTypes";

export interface CrmSidePanelContact {
  id: number;
  name: string;
  company: string | null;
}

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
  setCrmModalType: (crmModalType: CrmModalTypes) => void;
  openContactSidePanel: (contact: CrmSidePanelContact) => void;
  closeContactSidePanel: () => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddContactModalOpen: boolean;
  crmModalType: CrmModalTypes;
  isContactSidePanelOpen: boolean;
  selectedContactForPanel: CrmSidePanelContact | null;
}
