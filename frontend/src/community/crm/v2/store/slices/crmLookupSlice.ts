import {
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskTypeEntity
} from "~community/crm/types/CrmTypes";

export interface CrmLookupSlice {
  owners: Record<number, CrmOwnerEntity>;
  stages: Record<number, CrmStageEntity>;
  taskTypes: Record<number, CrmTaskTypeEntity>;

  upsertOwners: (owners: CrmOwnerEntity[]) => void;

  upsertStages: (stages: CrmStageEntity[]) => void;
  removeStage: (stageId: number) => void;

  upsertTaskTypes: (taskTypes: CrmTaskTypeEntity[]) => void;
}
