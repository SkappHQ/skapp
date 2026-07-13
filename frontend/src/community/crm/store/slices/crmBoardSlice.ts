import { SetType } from "~community/common/types/CommonTypes";
import {
  CrmBoardDealSliceType,
  CrmBoardStageDealsType
} from "~community/crm/types/BoardTypes";
import { CrmBoardSliceTypes } from "~community/crm/types/SliceTypes";
import {
  addDealToStageMap,
  appendDealsToStageMap,
  removeDealFromStageMap,
  replaceStagesInStageMap,
  updateDealInStageMap
} from "~community/crm/utils/kanbanUtil";

const CrmBoardSlice = (set: SetType<CrmBoardSliceTypes>) => ({
  boardStageDeals: [],
  setBoardStageDeals: (boardStageDeals: CrmBoardStageDealsType[]) =>
    set({ boardStageDeals }),
  appendBoardStageDeals: (stageDeals: CrmBoardStageDealsType) =>
    set((state) => ({
      boardStageDeals: appendDealsToStageMap(state.boardStageDeals, stageDeals)
    })),
  addDealToStage: (deal: CrmBoardDealSliceType) =>
    set((state) => ({
      boardStageDeals: addDealToStageMap(state.boardStageDeals, deal)
    })),
  updateDealInStage: (deal: CrmBoardDealSliceType) =>
    set((state) => ({
      boardStageDeals: updateDealInStageMap(state.boardStageDeals, deal)
    })),
  removeDealFromStage: (dealId: number) =>
    set((state) => ({
      boardStageDeals: removeDealFromStageMap(state.boardStageDeals, dealId)
    })),
  replaceBoardStageDeals: (stageDeals: CrmBoardStageDealsType[]) =>
    set((state) => ({
      boardStageDeals: replaceStagesInStageMap(
        state.boardStageDeals,
        stageDeals
      )
    })),
  preselectedStageId: null,
  setPreselectedStageId: (stageId: number | null) =>
    set({ preselectedStageId: stageId })
});

export default CrmBoardSlice;
