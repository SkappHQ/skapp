import { CrmBoardStageDealsResponseType } from "./BoardTypes";
import {
  CrmCompanyMetricsType,
  CrmContactLookup,
  CrmDealStageType,
  CrmOwner,
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
  setIsCrmSidePanelOpen: (isCrmSidePanelOpen: boolean) => void;
  setPreselectedStageId: (preselectedStageId: number | null) => void;
  setSelectedContactId: (contactId: number | null) => void;
  setBoardStages: (boardStages: CrmDealStageType[]) => void;
  setBoardContacts: (boardContacts: CrmContactLookup[]) => void;
  setBoardOwners: (boardOwners: CrmOwner[]) => void;
  setBoardStageDeals: (
    boardStageDeals: CrmBoardStageDealsResponseType[]
  ) => void;
  appendBoardStageDeals: (stageDeals: CrmBoardStageDealsResponseType) => void;
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
  preselectedStageId: number | null;
  selectedContactId: number | null;
  boardStages: CrmDealStageType[];
  boardContacts: CrmContactLookup[];
  boardOwners: CrmOwner[];
  boardStageDeals: CrmBoardStageDealsResponseType[];
}
