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
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setPreselectedContact: (contact: PreselectedContact | null) => void;
  setIsCrmSidePanelOpen: (isCrmSidePanelOpen: boolean) => void;
  setSelectedContactId: (contactId: number | null) => void;
  setSelectedTask: (selectedTask: CrmTaskDetailType | null) => void;
  setBoardStages: (boardStages: CrmDealStageType[]) => void;
  setBoardContacts: (boardContacts: CrmContactLookup[]) => void;
  setBoardOwners: (boardOwners: CrmOwner[]) => void;
  setBoardCrmRoles: (boardCrmRoles: string[]) => void;
  setBoardStageDeals: (
    boardStageDeals: CrmBoardStageDealsResponseType[]
  ) => void;
  appendBoardStageDeals: (stageDeals: CrmBoardStageDealsResponseType) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  preselectedContact: PreselectedContact | null;
  isCrmSidePanelOpen: boolean;
  selectedContactId: number | null;
  selectedTask: CrmTaskDetailType | null;
  boardStages: CrmDealStageType[];
  boardContacts: CrmContactLookup[];
  boardOwners: CrmOwner[];
  boardCrmRoles: string[];
  boardStageDeals: CrmBoardStageDealsResponseType[];
}
