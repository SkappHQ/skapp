import { useMemo } from "react";

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
// normalized records. Each hook selects the stable input records atomically and
// derives its result with `useMemo`, so re-renders are bound to the sliced data.

export const useDealById = (id: number | null): CrmDealEntity | undefined =>
  useCrmStoreV2((state) => (id != null ? state.deals[id] : undefined));

export const useStageById = (id: number | null): CrmStageEntity | undefined =>
  useCrmStoreV2((state) => (id != null ? state.stages[id] : undefined));

// Resolved, ordered deals for the list/table view (dealIds order).
export const useListDeals = (): CrmDealEntity[] => {
  const dealIds = useCrmStoreV2((state) => state.dealIds);
  const deals = useCrmStoreV2((state) => state.deals);

  return useMemo(
    () =>
      dealIds
        .map((id) => deals[id])
        .filter((deal): deal is CrmDealEntity => Boolean(deal)),
    [dealIds, deals]
  );
};

// Reference stages ordered by their orderIndex — the source of column order for
// the board and stage options for the deal form. Derived from the `stages`
// record (loaded once by the CRM data provider), so it does not depend on the
// separate `stageIds` UI array being populated.
export const useOrderedStages = (): CrmStageEntity[] => {
  const stages = useCrmStoreV2((state) => state.stages);

  return useMemo(
    () =>
      Object.values(stages).sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      ),
    [stages]
  );
};

// Column order for the board (one lane per stage id, in stage order).
export const useBoardStageIds = (): number[] => {
  const stages = useCrmStoreV2((state) => state.stages);

  return useMemo(
    () =>
      Object.values(stages)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((stage) => stage.id)
        .filter((id): id is number => id != null),
    [stages]
  );
};

export const useBoardColumn = (
  stageId: number
): CrmBoardColumn | undefined =>
  useCrmStoreV2((state) => state.board[stageId]);

// Resolved, ordered deals for a single column.
export const useBoardColumnDeals = (stageId: number): CrmDealEntity[] => {
  const column = useCrmStoreV2((state) => state.board[stageId]);
  const deals = useCrmStoreV2((state) => state.deals);

  return useMemo(() => {
    const dealIds = column?.dealIds ?? [];
    return dealIds
      .map((id) => deals[id])
      .filter((deal): deal is CrmDealEntity => Boolean(deal));
  }, [column, deals]);
};

export interface ResolvedBoardCard {
  deal: CrmDealEntity | undefined;
  owner: CrmOwnerEntity | undefined;
  contact: CrmContactEntity | undefined;
  company: CrmCompanyEntity | undefined;
}

// Everything a deal card needs, joined from the shared records. The card's
// company resolves from the deal's own companyId (hydrated via /company/batch).
export const useResolvedBoardCard = (dealId: number): ResolvedBoardCard => {
  const deal = useCrmStoreV2((state) => state.deals[dealId]);
  const owners = useCrmStoreV2((state) => state.owners);
  const contacts = useCrmStoreV2((state) => state.contacts);
  const companies = useCrmStoreV2((state) => state.companies);

  return useMemo(
    () => ({
      deal,
      owner: deal?.ownerId != null ? owners[deal.ownerId] : undefined,
      contact:
        deal?.contactId != null ? contacts[deal.contactId] : undefined,
      company:
        deal?.companyId != null ? companies[deal.companyId] : undefined
    }),
    [deal, owners, contacts, companies]
  );
};
