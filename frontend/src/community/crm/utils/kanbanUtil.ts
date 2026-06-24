import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

export interface StageState {
  deals: CrmDealBoardType[];
  totalCount: number;
}

export type StageMap = Record<number, StageState>;

export const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()];

export const resolveTargetStageId = (
  overId: string,
  stageMap: StageMap
): number | null => {
  const id = Number(overId);
  if (id in stageMap) return id;
  const entry = Object.entries(stageMap).find(([, s]) =>
    s.deals.some((d) => d.id === id)
  );
  return entry ? Number(entry[0]) : null;
};

export const buildInitialStageState = (
  stages: CrmDealStageType[],
  dealsByStage: Record<number, CrmDealBoardType[]>
): StageMap =>
  Object.fromEntries(
    stages.map((s) => {
      const deals = dealsByStage[s.id] ?? [];
      return [s.id, { deals, totalCount: deals.length }];
    })
  );
