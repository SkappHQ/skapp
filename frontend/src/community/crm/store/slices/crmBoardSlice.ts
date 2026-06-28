import { SetType } from "~community/common/types/CommonTypes";
import { CrmBoardStageDealsResponseType } from "~community/crm/types/BoardTypes";
import {
  CrmContactLookup,
  CrmDealStageType,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { CrmBoardSliceTypes } from "~community/crm/types/SliceTypes";

const CrmBoardSlice = (set: SetType<CrmBoardSliceTypes>) => ({
  boardStages: [],
  boardContacts: [],
  boardOwners: [],
  boardCrmRoles: [],
  boardStageDeals: [],
  setBoardStages: (boardStages: CrmDealStageType[]) => set({ boardStages }),
  setBoardContacts: (boardContacts: CrmContactLookup[]) =>
    set({ boardContacts }),
  setBoardOwners: (boardOwners: CrmOwner[]) => set({ boardOwners }),
  setBoardCrmRoles: (boardCrmRoles: string[]) => set({ boardCrmRoles }),
  setBoardStageDeals: (boardStageDeals: CrmBoardStageDealsResponseType[]) =>
    set({ boardStageDeals }),
  appendBoardStageDeals: (stageDeals: CrmBoardStageDealsResponseType) =>
    set((state) => ({
      boardStageDeals: state.boardStageDeals.map((stage) =>
        stage.stageId === stageDeals.stageId
          ? {
              ...stageDeals,
              deals: [...stage.deals, ...stageDeals.deals]
            }
          : stage
      )
    }))
});

export default CrmBoardSlice;
