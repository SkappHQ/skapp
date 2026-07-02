import { SetType } from "~community/common/types/CommonTypes";
import {
  CrmBoardDealSliceType,
  CrmBoardStageDealsType
} from "~community/crm/types/BoardTypes";
import { CrmBoardSliceTypes } from "~community/crm/types/SliceTypes";

const appendDealsToStage = (
  stages: CrmBoardStageDealsType[],
  stageDeals: CrmBoardStageDealsType
): CrmBoardStageDealsType[] =>
  stages.map((stage) =>
    stage.stageId === stageDeals.stageId
      ? { ...stageDeals, deals: [...stage.deals, ...stageDeals.deals] }
      : stage
  );

const addDeal = (
  stages: CrmBoardStageDealsType[],
  deal: CrmBoardDealSliceType
): CrmBoardStageDealsType[] =>
  stages.map((stage) =>
    stage.stageId === deal.stageId
      ? {
          ...stage,
          deals: [...stage.deals, deal],
          totalCount: stage.totalCount + 1
        }
      : stage
  );

const CrmBoardSlice = (set: SetType<CrmBoardSliceTypes>) => ({
  boardStageDeals: [],
  setBoardStageDeals: (boardStageDeals: CrmBoardStageDealsType[]) =>
    set({ boardStageDeals }),
  appendBoardStageDeals: (stageDeals: CrmBoardStageDealsType) =>
    set((state) => ({
      boardStageDeals: appendDealsToStage(state.boardStageDeals, stageDeals)
    })),
  addDealToStage: (deal: CrmBoardDealSliceType) =>
    set((state) => ({
      boardStageDeals: addDeal(state.boardStageDeals, deal)
    }))
});

export default CrmBoardSlice;
