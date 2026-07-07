import { CrmBoardDealSliceType, CrmBoardStageDealsType } from "./BoardTypes";
import {
  CrmCompanyMetricsType,
  CrmContact,
  CrmTaskDetailType
} from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";
import { CrmSidePanelTypes } from "./SidePanelTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsContactModalOpen: (isContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setSelectedTaskId: (taskId: number | null) => void;
  setTasks: (tasks: CrmTaskDetailType[]) => void;
  getTaskById: (id: number) => CrmTaskDetailType | undefined;
  updateTask: (task: Partial<CrmTaskDetailType>) => void;
  openCrmSidePanel: (type: CrmSidePanelTypes) => void;
  closeCrmSidePanel: () => void;
  setSelectedContactId: (contactId: number | null) => void;
  setContacts: (contacts: CrmContact[]) => void;
  updateContact: (contact: CrmContact) => void;
  getContactById: (id: number) => CrmContact | undefined;
  setSelectedDealId: (dealId: number | null) => void;
  setBoardStageDeals: (boardStageDeals: CrmBoardStageDealsType[]) => void;
  appendBoardStageDeals: (stageDeals: CrmBoardStageDealsType) => void;
  addDealToStage: (deal: CrmBoardDealSliceType) => void;
  setPreselectedStageId: (stageId: number | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  selectedTaskId: number | null;
  tasks: CrmTaskDetailType[];
  isCrmSidePanelOpen: boolean;
  crmSidePanelType: CrmSidePanelTypes | null;
  selectedContactId: number | null;
  contacts: Record<number, CrmContact>;
  selectedDealId: number | null;
  boardStageDeals: CrmBoardStageDealsType[];
  preselectedStageId: number | null;
}
