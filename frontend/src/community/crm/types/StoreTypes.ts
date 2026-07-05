import {
  CrmCompanyMetricsType,
  CrmDealListItem,
  CrmTaskDetailType,
  PreselectedContact
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
  setPreselectedContact: (contact: PreselectedContact | null) => void;
  setSelectedTaskId: (taskId: number | null) => void;
  setTasks: (tasks: CrmTaskDetailType[]) => void;
  getTaskById: (id: number) => CrmTaskDetailType | undefined;
  openCrmSidePanel: (type: CrmSidePanelTypes) => void;
  pushCrmSidePanel: (type: CrmSidePanelTypes) => void;
  popCrmSidePanel: () => void;
  closeCrmSidePanel: () => void;
  setSelectedContactId: (contactId: number | null) => void;
  setSelectedDealId: (dealId: number | null) => void;
  setDeals: (deals: CrmDealListItem[]) => void;
  getDealById: (id: number) => CrmDealListItem | undefined;
  updateDeal: (deal: Partial<CrmDealListItem>) => void;
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
  crmSidePanelType: CrmSidePanelTypes | null;
  previousCrmSidePanelType: CrmSidePanelTypes | null;
  selectedContactId: number | null;
  selectedDealId: number | null;
  deals: CrmDealListItem[];
}
