import { SetType } from "~community/common/types/CommonTypes";
import {
  CrmBoardDealSliceType,
  CrmBoardStageDealsType
} from "~community/crm/types/BoardTypes";
import { CrmBoardSliceTypes } from "~community/crm/types/SliceTypes";
import {
  addDealToStageMap,
  appendDealsToStageMap
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
    }))
});

export default CrmBoardSlice;
