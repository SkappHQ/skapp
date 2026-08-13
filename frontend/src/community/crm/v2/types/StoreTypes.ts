import {
  CrmBoardColumn,
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskEntity,
  CrmTaskTypeEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";

interface ActionTypes {
  setCompanies: (companies: Record<number, CrmCompanyEntity>) => void;
  setContacts: (contacts: Record<number, CrmContactEntity>) => void;
  setDeals: (deals: Record<number, CrmDealEntity>) => void;
  setBoardColumn: (board: Record<number, CrmBoardColumn>) => void;
  setTasks: (tasks: Record<number, CrmTaskEntity>) => void;
  setOwners: (owners: Record<number, CrmOwnerEntity>) => void;
  setStages: (stages: Record<number, CrmStageEntity>) => void;
  setTaskTypes: (taskTypes: Record<number, CrmTaskTypeEntity>) => void;

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
}

export interface CrmStore extends ActionTypes {
  companies: Record<number, CrmCompanyEntity>;
  contacts: Record<number, CrmContactEntity>;
  deals: Record<number, CrmDealEntity>;
  board: Record<number, CrmBoardColumn>;
  tasks: Record<number, CrmTaskEntity>;
  owners: Record<number, CrmOwnerEntity>;
  stages: Record<number, CrmStageEntity>;
  taskTypes: Record<number, CrmTaskTypeEntity>;

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
}
