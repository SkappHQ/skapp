import {
  CrmBoardColumn,
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskEntity,
  CrmTaskTypeEntity
} from "~community/crm/types/CrmTypes";

export interface CrmDataSlice {
  companies: Record<number, CrmCompanyEntity>;
  companyIds: number[];

  getCompanyById: (companyId: number) => CrmCompanyEntity | undefined;

  setCompanies: (
    companies: Record<number, CrmCompanyEntity>,
    companyIds?: number[]
  ) => void;
  removeCompany: (companyId: number) => void;

  contacts: Record<number, CrmContactEntity>;
  contactIds: number[];

  getContactById: (contactId: number) => CrmContactEntity | undefined;

  setContacts: (
    contacts: Record<number, CrmContactEntity>,
    contactIds?: number[]
  ) => void;
  removeContact: (contactId: number) => void;

  deals: Record<number, CrmDealEntity>;
  dealIds: number[];
  board: Record<number, CrmBoardColumn>;

  getDealById: (dealId: number) => CrmDealEntity | undefined;

  setDeals: (deals: Record<number, CrmDealEntity>, dealIds?: number[]) => void;
  removeDeal: (dealId: number) => void;

  setBoardColumn: (stageId: number, column: CrmBoardColumn) => void;
  moveDeal: (
    dealId: number,
    toStageId: number,
    toIndex: number
  ) => { previousDealId: number | null; nextDealId: number | null };

  tasks: Record<number, CrmTaskEntity>;
  taskIds: number[];

  getTaskById: (taskId: number) => CrmTaskEntity | undefined;

  setTasks: (tasks: Record<number, CrmTaskEntity>, taskIds?: number[]) => void;
  removeTask: (taskId: number) => void;

  owners: Record<number, CrmOwnerEntity>;
  stages: Record<number, CrmStageEntity>;
  taskTypes: Record<number, CrmTaskTypeEntity>;

  getOwnerById: (ownerId: number) => CrmOwnerEntity | undefined;
  getStageById: (stageId: number) => CrmStageEntity | undefined;
  getTaskTypeById: (taskTypeId: number) => CrmTaskTypeEntity | undefined;

  setOwners: (owners: Record<number, CrmOwnerEntity>) => void;

  setStages: (stages: Record<number, CrmStageEntity>) => void;
  removeStage: (stageId: number) => void;

  setTaskTypes: (taskTypes: Record<number, CrmTaskTypeEntity>) => void;
}
