import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";

export interface CrmUiSlice {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;

  selectedCompanyId: number | null;
  selectedContactId: number | null;
  selectedDealId: number | null;
  selectedTaskId: number | null;

  isCrmSidePanelOpen: boolean;
  crmSidePanelType: CrmSidePanelTypes | null;

  preselectedStageId: number | null;

  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsContactModalOpen: (isContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;

  setSelectedCompanyId: (selectedCompanyId: number | null) => void;
  setSelectedContactId: (selectedContactId: number | null) => void;
  setSelectedDealId: (selectedDealId: number | null) => void;
  setSelectedTaskId: (selectedTaskId: number | null) => void;

  openCrmSidePanel: (crmSidePanelType: CrmSidePanelTypes) => void;
  closeCrmSidePanel: () => void;

  setPreselectedStageId: (preselectedStageId: number | null) => void;
}
