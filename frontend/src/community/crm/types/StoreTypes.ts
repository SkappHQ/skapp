import {
  CrmCompanyMetricsType,
  CrmTaskDetailType,
  PreselectedContact
} from "./CommonTypes";
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
  updateTask: (task: Partial<CrmTaskDetailType>) => void;
  setIsCrmSidePanelOpen: (isCrmSidePanelOpen: boolean) => void;
  setSelectedContactId: (contactId: number | null) => void;
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
}
