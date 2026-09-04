import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  CrmDealStageEnum,
  DefaultStageNameEnum
} from "~community/crm/v2/enums/common";
import {
  CrmStageEntity,
  CrmStageRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import { CrmDealStageReorderItem } from "~community/crm/v2/types/CrmTypes";

export const getSelectedStage = (
  stages: CrmStageRecord,
  stageId: number | null
): CrmStageEntity | undefined => {
  if (stageId !== null) {
    return stages[stageId];
  }
};

export const toStageIds = (stages: CrmStageEntity[]): number[] => {
  const stageIds: number[] = [];
  for (const stage of stages) {
    if (stage.id !== undefined) {
      stageIds.push(stage.id);
    }
  }
  return stageIds;
};

export const getChangedStageFields = (
  initialValues: CrmStageEntity,
  currentValues: CrmStageEntity
): CrmStageEntity => {
  const changedFields: CrmStageEntity = {};

  if (currentValues.name?.trim() !== initialValues.name?.trim()) {
    changedFields.name = currentValues.name?.trim();
  }

  if (currentValues.description?.trim() !== initialValues.description?.trim()) {
    changedFields.description = currentValues.description?.trim();
  }

  if (currentValues.color !== initialValues.color) {
    changedFields.color = currentValues.color;
  }

  return changedFields;
};

export const updateStage = (
  stages: CrmStageRecord,
  stageId: number,
  updatedFields: CrmStageEntity
): CrmStageRecord => ({
  ...stages,
  [stageId]: { ...stages[stageId], ...updatedFields }
});

export const removeStage = (
  stages: CrmStageRecord,
  stageId: number
): CrmStageRecord => {
  const remainingStages = { ...stages };
  delete remainingStages[stageId];

  return remainingStages;
};

/** WON and LOST are pinned to the end, so the backend reorders only the rest. */
export const toStageReorderPayload = (
  orderedStages: CrmStageEntity[]
): CrmDealStageReorderItem[] => {
  const payload: CrmDealStageReorderItem[] = [];

  for (const stage of orderedStages) {
    const isPinned =
      stage.stageType === CrmDealStageEnum.WON ||
      stage.stageType === CrmDealStageEnum.LOST;

    if (stage.id !== undefined && !isPinned) {
      payload.push({ id: stage.id, orderIndex: payload.length + 1 });
    }
  }

  return payload;
};

const toStandardStageName = (stageName: string): string =>
  stageName.trim().replace(/\s+/g, "_").toUpperCase();

export const isStageNameTaken = (
  stages: CrmStageEntity[],
  stageName: string,
  currentStageId?: number
): boolean => {
  const standardName = toStandardStageName(stageName);

  return stages.some(
    (stage) =>
      stage.id !== currentStageId &&
      stage.name !== undefined &&
      toStandardStageName(stage.name) === standardName
  );
};

export const getStageDisplayName = (
  stageName: string,
  translateText: TranslatorFunctionType
): string =>
  Object.values<string>(DefaultStageNameEnum).includes(stageName)
    ? translateText([stageName])
    : stageName;
