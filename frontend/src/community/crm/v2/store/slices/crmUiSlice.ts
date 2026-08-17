import { StateCreator } from "zustand";

import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import { CrmUiSliceTypes } from "~community/crm/v2/types/SliceTypes";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";

const CrmUiSlice: StateCreator<
  CrmStore,
  [["zustand/devtools", never]],
  [],
  CrmUiSliceTypes
> = (set) => ({
  companyIds: [],
  contactIds: [],
  dealIds: [],
  taskIds: [],
  stageIds: [],

  isCompanyModalOpen: false,
  companyModalType: CrmModalTypes.ADD_COMPANY_MODAL,
  isContactModalOpen: false,
  contactModalType: CrmModalTypes.ADD_CONTACT_MODAL,
  isTaskModalOpen: false,
  taskModalType: CrmModalTypes.ADD_TASK_MODAL,

  selectedCompanyId: null,
  selectedContactId: null,
  selectedDealId: null,
  selectedTaskId: null,

  isCrmSidePanelOpen: false,
  crmSidePanelType: null,

  preselectedStageId: null,

  isTaskTypesInitialized: false,

  setCompanyIds: (companyIds: number[]) => set({ companyIds }),
  setContactIds: (contactIds: number[]) => set({ contactIds }),
  setDealIds: (dealIds: number[]) => set({ dealIds }),
  setTaskIds: (taskIds: number[]) => set({ taskIds }),
  setStageIds: (stageIds: number[]) => set({ stageIds }),

  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) =>
    set({ isCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType }),
  setIsContactModalOpen: (isContactModalOpen: boolean) =>
    set({ isContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType }),
  setIsTaskModalOpen: (isTaskModalOpen: boolean) => set({ isTaskModalOpen }),
  setTaskModalType: (taskModalType: CrmModalTypes) => set({ taskModalType }),

  setSelectedCompanyId: (selectedCompanyId: number | null) =>
    set({ selectedCompanyId }),
  setSelectedContactId: (selectedContactId: number | null) =>
    set({ selectedContactId }),
  setSelectedDealId: (selectedDealId: number | null) => set({ selectedDealId }),
  setSelectedTaskId: (selectedTaskId: number | null) => set({ selectedTaskId }),

  openCrmSidePanel: (crmSidePanelType: CrmSidePanelTypes) =>
    set({ isCrmSidePanelOpen: true, crmSidePanelType }),
  closeCrmSidePanel: () =>
    set({ isCrmSidePanelOpen: false, crmSidePanelType: null }),

  setPreselectedStageId: (preselectedStageId: number | null) =>
    set({ preselectedStageId }),

  setIsTaskTypesInitialized: (isTaskTypesInitialized: boolean) =>
    set({ isTaskTypesInitialized })
});

export default CrmUiSlice;
