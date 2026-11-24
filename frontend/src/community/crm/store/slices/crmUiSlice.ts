import { StateCreator } from "zustand";

import { ActivityType } from "~community/crm/activities/types/activityTypes";
import { CrmActivityPrefill } from "~community/crm/types/CrmCommonTypes";
import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/types/CrmTypes";
import { CrmUiSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmStore } from "~community/crm/types/StoreTypes";

const CrmUiSlice: StateCreator<
  CrmStore,
  [["zustand/devtools", never]],
  [],
  CrmUiSliceTypes
> = (set, get) => ({
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
  isRecordActivityModalOpen: false,
  recordActivityModalType: ActivityType.TASK,
  recordActivityPrefill: { contactId: null, dealId: null, companyId: null },
  isDealStageModalOpen: false,
  dealStageModalType: CrmModalTypes.ADD_DEAL_STAGE_MODAL,

  selectedCompanyId: null,
  selectedContactId: null,
  selectedDealId: null,
  selectedTaskId: null,
  selectedDealStageId: null,
  selectedCallId: null,
  selectedMeetingId: null,
  selectedActivityTaskId: null,
  selectedEmailId: null,

  isCrmSidePanelOpen: false,
  crmSidePanelType: null,
  crmSidePanelReturnType: null,

  preselectedStageId: null,

  isCrmDataInitialized: false,

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
  setIsRecordActivityModalOpen: (isRecordActivityModalOpen: boolean) =>
    set({ isRecordActivityModalOpen }),
  setRecordActivityModalType: (recordActivityModalType: ActivityType) =>
    set({ recordActivityModalType }),
  setRecordActivityPrefill: (recordActivityPrefill: CrmActivityPrefill) =>
    set({ recordActivityPrefill }),
  setRecordActivityTriggerId: (recordActivityTriggerId: string) =>
    set({ recordActivityTriggerId }),
  setIsDealStageModalOpen: (isDealStageModalOpen: boolean) =>
    set({ isDealStageModalOpen }),
  setDealStageModalType: (dealStageModalType: CrmModalTypes) =>
    set({ dealStageModalType }),

  setSelectedCompanyId: (selectedCompanyId: number | null) =>
    set({ selectedCompanyId }),
  setSelectedContactId: (selectedContactId: number | null) =>
    set({ selectedContactId }),
  setSelectedDealId: (selectedDealId: number | null) => set({ selectedDealId }),
  setSelectedTaskId: (selectedTaskId: number | null) => set({ selectedTaskId }),
  setSelectedDealStageId: (selectedDealStageId: number | null) =>
    set({ selectedDealStageId }),
  setSelectedCallId: (selectedCallId: number | null) => set({ selectedCallId }),
  setSelectedMeetingId: (selectedMeetingId: number | null) =>
    set({ selectedMeetingId }),
  setSelectedActivityTaskId: (selectedActivityTaskId: number | null) =>
    set({ selectedActivityTaskId }),
  setSelectedEmailId: (selectedEmailId: number | null) =>
    set({ selectedEmailId }),

  openCrmSidePanel: (crmSidePanelType: CrmSidePanelTypes) =>
    set({ isCrmSidePanelOpen: true, crmSidePanelType }),
  closeCrmSidePanel: () =>
    set({
      isCrmSidePanelOpen: false,
      crmSidePanelType: null,
      crmSidePanelReturnType: null,
      selectedContactId: null,
      selectedCompanyId: null,
      selectedMeetingId: null,
      selectedActivityTaskId: null,
      selectedEmailId: null
    }),
  setCrmSidePanelReturnType: (
    crmSidePanelReturnType: CrmSidePanelTypes | null
  ) => set({ crmSidePanelReturnType }),
  closeActivitySidePanel: () => {
    const { crmSidePanelReturnType, closeCrmSidePanel } = get();

    if (!crmSidePanelReturnType) {
      closeCrmSidePanel();
      return;
    }

    set({
      crmSidePanelType: crmSidePanelReturnType,
      crmSidePanelReturnType: null
    });
  },

  setPreselectedStageId: (preselectedStageId: number | null) =>
    set({ preselectedStageId }),

  setIsCrmDataInitialized: (isCrmDataInitialized: boolean) =>
    set({ isCrmDataInitialized })
});

export default CrmUiSlice;
