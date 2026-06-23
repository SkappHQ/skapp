import {
  CrmCompanyMetricsType,
  CrmContactMetricsType,
  CrmTaskDetailType
} from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setIsCrmSidePanelOpen: (isCrmSidePanelOpen: boolean) => void;
  setSelectedContact: (selectedContact: CrmContactMetricsType | null) => void;
  setSelectedTaskId: (selectedTaskId: number | null) => void;
  setSelectedContactId: (contactId: number | null) => void;
  setSelectedTask: (selectedTask: CrmTaskDetailType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  isCrmSidePanelOpen: boolean;
  selectedContact: CrmContactMetricsType | null;
  selectedTaskId: number | null;
  selectedContactId: number | null;
  selectedTask: CrmTaskDetailType | null;
}
