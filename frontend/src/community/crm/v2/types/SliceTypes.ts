import {
  CrmBoardRecord,
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealRecord,
  CrmOwnerRecord,
  CrmStageRecord,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";

export interface CrmDataSliceTypes {
  companies: CrmCompanyRecord;
  contacts: CrmContactRecord;
  deals: CrmDealRecord;
  board: CrmBoardRecord;
  tasks: CrmTaskRecord;
  owners: CrmOwnerRecord;
  stages: CrmStageRecord;
  taskTypes: CrmTaskTypeRecord;

  setCompanies: (companies: CrmCompanyRecord) => void;
  setContacts: (contacts: CrmContactRecord) => void;
  setDeals: (deals: CrmDealRecord) => void;
  setBoardColumn: (board: CrmBoardRecord) => void;
  setTasks: (tasks: CrmTaskRecord) => void;
  setOwners: (owners: CrmOwnerRecord) => void;
  setStages: (stages: CrmStageRecord) => void;
  setTaskTypes: (taskTypes: CrmTaskTypeRecord) => void;
}

export interface CrmUiSliceTypes {
  companyIds: number[];
  contactIds: number[];
  dealIds: number[];
  taskIds: number[];
  stageIds: number[];

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

  crmSessionInitialised: boolean;

  setCompanyIds: (companyIds: number[]) => void;
  setContactIds: (contactIds: number[]) => void;
  setDealIds: (dealIds: number[]) => void;
  setTaskIds: (taskIds: number[]) => void;
  setStageIds: (stageIds: number[]) => void;

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

  setCrmSessionInitialised: (crmSessionInitialised: boolean) => void;
}
