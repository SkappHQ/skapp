import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";
import type { StageMap } from "~community/crm/types/BoardTypes";

export const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()];

export const resolveTargetStageId = (
  overId: string,
  stageMap: StageMap
): number | null => {
  const id = Number(overId);
  if (stageMap.some((s) => s.stageId === id)) return id;
  const stage = stageMap.find((s) => s.deals.some((d) => d.id === id));
  return stage ? stage.stageId : null;
};

export const buildInitialStageState = (
  stages: CrmDealStageType[],
  dealsByStage: Record<number, CrmDealBoardType[]>
): StageMap =>
  stages.map((s) => {
    const deals = dealsByStage[s.id] ?? [];
    return { stageId: s.id, deals, totalCount: deals.length };
  });
