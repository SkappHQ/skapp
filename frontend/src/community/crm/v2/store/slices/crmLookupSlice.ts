import {
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskTypeEntity
} from "~community/crm/v2/types/CrmTypes";

export interface CrmLookupSlice {
  owners: Record<number, CrmOwnerEntity>;
  stages: Record<number, CrmStageEntity>;
  stageIds: number[];
  taskTypes: Record<number, CrmTaskTypeEntity>;
  taskTypeIds: number[];

  upsertOwners: (owners: CrmOwnerEntity[]) => void;

  upsertStages: (stages: CrmStageEntity[]) => void;
  removeStage: (stageId: number) => void;
  setStageIds: (stageIds: number[]) => void;

  upsertTaskTypes: (taskTypes: CrmTaskTypeEntity[]) => void;
  setTaskTypeIds: (taskTypeIds: number[]) => void;
}
