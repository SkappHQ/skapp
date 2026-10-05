import { StateCreator } from "zustand";

import {
  CrmBoardRecord,
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealRecord,
  CrmIndustryRecord,
  CrmOwnerRecord,
  CrmStageRecord,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/types/CrmCommonTypes";
import { CrmDataSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmStore } from "~community/crm/types/StoreTypes";

const CrmDataSlice: StateCreator<
  CrmStore,
  [["zustand/devtools", never]],
  [],
  CrmDataSliceTypes
> = (set) => ({
  companies: {},
  contacts: {},
  deals: {},
  board: {},
  tasks: {},
  owners: {},
  stages: {},
  taskTypes: {},
  industries: {},

  setCompanies: (companies: CrmCompanyRecord) => set({ companies }),

  setContacts: (contacts: CrmContactRecord) => set({ contacts }),

  setDeals: (deals: CrmDealRecord) => set({ deals }),

  setBoardColumn: (board: CrmBoardRecord) => set({ board }),

  setTasks: (tasks: CrmTaskRecord) => set({ tasks }),

  setOwners: (owners: CrmOwnerRecord) => set({ owners }),

  setStages: (stages: CrmStageRecord) => set({ stages }),

  setTaskTypes: (taskTypes: CrmTaskTypeRecord) => set({ taskTypes }),

  setIndustries: (industries: CrmIndustryRecord) => set({ industries })
});

export default CrmDataSlice;
