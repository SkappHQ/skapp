import {
  CrmCompanyMetricsType,
  CrmTaskDetailType,
  PreselectedContact
} from "./CommonTypes";
import { DealSidePanelTypes } from "~community/crm/enums/common";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsContactModalOpen: (isContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setPreselectedContact: (contact: PreselectedContact | null) => void;
  setSelectedTaskId: (taskId: number | null) => void;
  setTasks: (tasks: CrmTaskDetailType[]) => void;
  getTaskById: (id: number) => CrmTaskDetailType | undefined;
  setIsCrmSidePanelOpen: (isCrmSidePanelOpen: boolean) => void;
  setSelectedContactId: (contactId: number | null) => void;
  setSelectedDealId: (dealId: number | null) => void;
  setActiveDealSidePanel: (panel: DealSidePanelTypes | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  preselectedContact: PreselectedContact | null;
  selectedTaskId: number | null;
  tasks: CrmTaskDetailType[];
  isCrmSidePanelOpen: boolean;
  selectedContactId: number | null;
  selectedDealId: number | null;
  activeDealSidePanel: DealSidePanelTypes | null;
}
