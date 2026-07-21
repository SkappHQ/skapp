import { CrmTaskGroupEnum } from "~community/crm/enums/common";

import { CrmBoardDealSliceType, CrmBoardStageDealsType } from "./BoardTypes";
import {
  CrmCompany,
  CrmContact,
  CrmDealResponseType,
  CrmTaskDetailType
} from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";
import { CrmSidePanelTypes } from "./SidePanelTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsContactModalOpen: (isContactModalOpen: boolean) => void;
  setContactModalType: (contactModalType: CrmModalTypes) => void;
  setSelectedCompanyId: (selectedCompanyId: number | null) => void;
  setCompanies: (companies: CrmCompany[]) => void;
  updateCompany: (company: CrmCompany) => void;
  updateCompanyTaskCompletion: (
    companyId: number,
    taskId: number,
    isCompleted: boolean
  ) => void;
  removeCompany: (id: number) => void;
  getCompanyById: (id: number) => CrmCompany | undefined;
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => void;
  setTaskModalType: (taskModalType: CrmModalTypes) => void;
  setSelectedTaskId: (taskId: number | null) => void;
  setTasks: (tasks: CrmTaskDetailType[], group: CrmTaskGroupEnum) => void;
  addTasks: (tasks: CrmTaskDetailType[]) => void;
  setTaskCompletion: (id: number, isCompleted: boolean) => void;
  getTaskById: (id: number) => CrmTaskDetailType | undefined;
  updateTask: (task: CrmTaskDetailType) => void;
  openCrmSidePanel: (type: CrmSidePanelTypes) => void;
  closeCrmSidePanel: () => void;
  setSelectedContactId: (contactId: number | null) => void;
  setContacts: (contacts: CrmContact[]) => void;
  updateContact: (contact: CrmContact) => void;
  updateContactTaskCompletion: (
    contactId: number,
    taskId: number,
    isCompleted: boolean
  ) => void;
  removeContact: (id: number) => void;
  getContactById: (id: number) => CrmContact | undefined;
  setSelectedDealId: (dealId: number | null) => void;
  setDeals: (deals: CrmDealResponseType[]) => void;
  getDealById: (id: number) => CrmDealResponseType | undefined;
  updateDeal: (deal: CrmDealResponseType) => void;
  removeDeal: (dealId: number) => void;
  setBoardStageDeals: (boardStageDeals: CrmBoardStageDealsType[]) => void;
  appendBoardStageDeals: (stageDeals: CrmBoardStageDealsType) => void;
  replaceBoardStageDeals: (stageDeals: CrmBoardStageDealsType[]) => void;
  addDealToStage: (deal: CrmBoardDealSliceType) => void;
  updateDealInStage: (deal: CrmBoardDealSliceType) => void;
  removeDealFromStage: (dealId: number) => void;
  setPreselectedStageId: (stageId: number | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isContactModalOpen: boolean;
  contactModalType: CrmModalTypes;
  selectedCompanyId: number | null;
  companies: CrmCompany[];
  isTaskModalOpen: boolean;
  taskModalType: CrmModalTypes;
  selectedTaskId: number | null;
  tasks: CrmTaskDetailType[];
  isCrmSidePanelOpen: boolean;
  crmSidePanelType: CrmSidePanelTypes | null;
  selectedContactId: number | null;
  contacts: CrmContact[];
  selectedDealId: number | null;
  deals: CrmDealResponseType[];
  boardStageDeals: CrmBoardStageDealsType[];
  preselectedStageId: number | null;
}
