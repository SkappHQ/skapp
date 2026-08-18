import { useShallow } from "zustand/react/shallow";

import {
  CrmBoardColumn,
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity
} from "../types/CrmCommonTypes";
import { useCrmStoreV2 } from "./store";

// Join selectors so components read resolved entities and never touch the raw
// normalized records. `useShallow` bounds re-renders to the sliced data.

export const useDealById = (id: number | null): CrmDealEntity | undefined =>
  useCrmStoreV2((state) => (id != null ? state.deals[id] : undefined));

export const useStageById = (id: number | null): CrmStageEntity | undefined =>
  useCrmStoreV2((state) => (id != null ? state.stages[id] : undefined));

// Resolved, ordered deals for the list/table view (dealIds order).
export const useListDeals = (): CrmDealEntity[] =>
  useCrmStoreV2(
    useShallow((state) =>
      state.dealIds
        .map((id) => state.deals[id])
        .filter((deal): deal is CrmDealEntity => Boolean(deal))
    )
  );

// Reference stages ordered by their orderIndex — the source of column order for
// the board and stage options for the deal form. Derived from the `stages`
// record (loaded once by the CRM data provider), so it does not depend on the
// separate `stageIds` UI array being populated.
export const useOrderedStages = (): CrmStageEntity[] =>
  useCrmStoreV2(
    useShallow((state) =>
      Object.values(state.stages).sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      )
    )
  );

// Column order for the board (one lane per stage id, in stage order).
export const useBoardStageIds = (): number[] =>
  useCrmStoreV2(
    useShallow((state) =>
      Object.values(state.stages)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((stage) => stage.id)
        .filter((id): id is number => id != null)
    )
  );

export const useBoardColumn = (
  stageId: number
): CrmBoardColumn | undefined =>
  useCrmStoreV2((state) => state.board[stageId]);

// Resolved, ordered deals for a single column.
export const useBoardColumnDeals = (stageId: number): CrmDealEntity[] =>
  useCrmStoreV2(
    useShallow((state) => {
      const dealIds = state.board[stageId]?.dealIds ?? [];
      return dealIds
        .map((id) => state.deals[id])
        .filter((deal): deal is CrmDealEntity => Boolean(deal));
    })
  );

export interface ResolvedBoardCard {
  deal: CrmDealEntity | undefined;
  owner: CrmOwnerEntity | undefined;
  contact: CrmContactEntity | undefined;
  company: CrmCompanyEntity | undefined;
}

// Everything a deal card needs, joined from the shared records. The card's
// company resolves from the deal's own companyId (hydrated via /company/batch).
export const useResolvedBoardCard = (dealId: number): ResolvedBoardCard =>
  useCrmStoreV2(
    useShallow((state) => {
      const deal = state.deals[dealId];
      return {
        deal,
        owner: deal?.ownerId != null ? state.owners[deal.ownerId] : undefined,
        contact:
          deal?.contactId != null ? state.contacts[deal.contactId] : undefined,
        company:
          deal?.companyId != null ? state.companies[deal.companyId] : undefined
      };
    })
  );
