import { SetType } from "~community/common/types/CommonTypes";
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
import { CrmDataSliceTypes } from "~community/crm/v2/types/SliceTypes";

const CrmDataSlice = (
  set: SetType<CrmDataSliceTypes>,
  get: () => CrmDataSliceTypes
) => ({
  companies: {} as Record<number, CrmCompanyEntity>,
  contacts: {} as Record<number, CrmContactEntity>,
  deals: {} as Record<number, CrmDealEntity>,
  board: {} as Record<number, CrmBoardColumn>,
  tasks: {} as Record<number, CrmTaskEntity>,
  owners: {} as Record<number, CrmOwnerEntity>,
  stages: {} as Record<number, CrmStageEntity>,
  taskTypes: {} as Record<number, CrmTaskTypeEntity>,

  setCompanies: (
    companies: Record<number, CrmCompanyEntity>,
    companyIds?: number[]
  ) => set({ companies, ...(companyIds !== undefined && { companyIds }) }),

  setContacts: (
    contacts: Record<number, CrmContactEntity>,
    contactIds?: number[]
  ) => set({ contacts, ...(contactIds !== undefined && { contactIds }) }),

  setDeals: (deals: Record<number, CrmDealEntity>, dealIds?: number[]) =>
    set({ deals, ...(dealIds !== undefined && { dealIds }) }),

  setBoardColumn: (stageId: number, column: CrmBoardColumn) =>
    set({ board: { ...get().board, [stageId]: column } }),

  setTasks: (tasks: Record<number, CrmTaskEntity>, taskIds?: number[]) =>
    set({ tasks, ...(taskIds !== undefined && { taskIds }) }),

  setOwners: (owners: Record<number, CrmOwnerEntity>) => set({ owners }),

  setStages: (stages: Record<number, CrmStageEntity>, stageIds: number[]) =>
    set({ stages, stageIds }),

  setTaskTypes: (taskTypes: Record<number, CrmTaskTypeEntity>) =>
    set({ taskTypes })
});

export default CrmDataSlice;
