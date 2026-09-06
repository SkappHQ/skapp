import { StateCreator } from "zustand";

import {
  CrmBoardRecord,
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmOwnerRecord,
  CrmStageRecord,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import { CrmDataSliceTypes } from "~community/crm/v2/types/SliceTypes";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import { mergeCompanies } from "~community/crm/v2/utils/companyUtil";
import { mergeDeals } from "~community/crm/v2/utils/dealUtil";

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

  addCompanies: (companies: CrmCompanyEntity[]) =>
    set((state) => ({ companies: mergeCompanies(state.companies, companies) })),

  setContacts: (contacts: CrmContactRecord) => set({ contacts }),

  setDeals: (deals: CrmDealRecord) => set({ deals }),

  addDeals: (deals: CrmDealEntity[]) =>
    set((state) => ({ deals: mergeDeals(state.deals, deals) })),

  setBoardColumn: (board: CrmBoardRecord) => set({ board }),

  setTasks: (tasks: CrmTaskRecord) => set({ tasks }),

  setOwners: (owners: CrmOwnerRecord) => set({ owners }),

  setStages: (stages: CrmStageRecord) => set({ stages }),

  setTaskTypes: (taskTypes: CrmTaskTypeRecord) => set({ taskTypes })
});

export default CrmDataSlice;
