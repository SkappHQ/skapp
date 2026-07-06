import { SetType } from "~community/common/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { CrmStore } from "~community/crm/types/StoreTypes";

const CrmSidePanelSlice = (set: SetType<CrmStore>) => ({
  isCrmSidePanelOpen: false,
  crmSidePanelType: null,
  previousCrmSidePanelType: null,
  preselectedStageId: null,
  openCrmSidePanel: (type: CrmSidePanelTypes) =>
    set({
      isCrmSidePanelOpen: true,
      crmSidePanelType: type,
      previousCrmSidePanelType: null,
      preselectedContact: null
    }),
  pushCrmSidePanel: (type: CrmSidePanelTypes) =>
    set((state) => {
      if (state.crmSidePanelType === type) return state;
      return {
        isCrmSidePanelOpen: true,
        crmSidePanelType: type,
        previousCrmSidePanelType: state.crmSidePanelType
      };
    }),
  popCrmSidePanel: () =>
    set((state) => ({
      crmSidePanelType: state.previousCrmSidePanelType,
      previousCrmSidePanelType: null,
      isCrmSidePanelOpen: state.previousCrmSidePanelType !== null,
      preselectedContact: null
    })),
  closeCrmSidePanel: () =>
    set({
      isCrmSidePanelOpen: false,
      crmSidePanelType: null,
      previousCrmSidePanelType: null,
      preselectedContact: null
    }),
  setPreselectedStageId: (preselectedStageId: number | null) =>
    set({ preselectedStageId })
});

export default CrmSidePanelSlice;
