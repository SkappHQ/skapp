import { StateCreator } from "zustand";

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
import { CrmDataSliceTypes } from "~community/crm/v2/types/SliceTypes";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";

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

  setCompanies: (companies: CrmCompanyRecord) => set({ companies }),

  setContacts: (contacts: CrmContactRecord) => set({ contacts }),

  setDeals: (deals: CrmDealRecord) => set({ deals }),

  setBoardColumn: (board: CrmBoardRecord) => set({ board }),

  setTasks: (tasks: CrmTaskRecord) => set({ tasks }),

  setOwners: (owners: CrmOwnerRecord) => set({ owners }),

  setStages: (stages: CrmStageRecord) => set({ stages }),

  setTaskTypes: (taskTypes: CrmTaskTypeRecord) => set({ taskTypes })
});

export default CrmDataSlice;
