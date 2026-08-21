import { useMemo } from "react";
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

export const useDealById = (id: number | null): CrmDealEntity | undefined =>
  useCrmStoreV2((state) => (id != null ? state.deals[id] : undefined));

export const useStageById = (id: number | null): CrmStageEntity | undefined =>
  useCrmStoreV2((state) => (id != null ? state.stages[id] : undefined));

export const useListDeals = (): CrmDealEntity[] => {
  const { dealIds, deals } = useCrmStoreV2(
    useShallow((store) => ({
      dealIds: store.dealIds,
      deals: store.deals
    }))
  );

  return useMemo(
    () =>
      dealIds
        .map((id) => deals[id])
        .filter((deal): deal is CrmDealEntity => Boolean(deal)),
    [dealIds, deals]
  );
};

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

export const useBoardColumnDeals = (stageId: number): CrmDealEntity[] => {
  const { column, deals } = useCrmStoreV2(
    useShallow((store) => ({
      column: store.board[stageId],
      deals: store.deals
    }))
  );

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

export const useResolvedBoardCard = (dealId: number): ResolvedBoardCard => {
  const { deal, owners, contacts, companies } = useCrmStoreV2(
    useShallow((store) => ({
      deal: store.deals[dealId],
      owners: store.owners,
      contacts: store.contacts,
      companies: store.companies
    }))
  );

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
