import {
  CrmBoardColumn,
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmContactEntity,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmStageEntity,
  CrmStageRecord
} from "../types/CrmCommonTypes";

export interface ResolvedBoardCard {
  deal: CrmDealEntity | undefined;
  owner: CrmOwnerEntity | undefined;
  contact: CrmContactEntity | undefined;
  company: CrmCompanyEntity | undefined;
}

export const resolveDeals = (
  dealIds: number[],
  deals: CrmDealRecord
): CrmDealEntity[] =>
  dealIds
    .map((id) => deals[id])
    .filter((deal): deal is CrmDealEntity => Boolean(deal));

export const getOrderedStages = (stages: CrmStageRecord): CrmStageEntity[] =>
  Object.values(stages).sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

export const getBoardStageIds = (stages: CrmStageRecord): number[] =>
  getOrderedStages(stages)
    .map((stage) => stage.id)
    .filter((id): id is number => id != null);

export const resolveColumnDeals = (
  column: CrmBoardColumn | undefined,
  deals: CrmDealRecord
): CrmDealEntity[] =>
  (column?.dealIds ?? [])
    .map((id) => deals[id])
    .filter((deal): deal is CrmDealEntity => Boolean(deal));

export const resolveBoardCard = (
  deal: CrmDealEntity | undefined,
  owners: CrmOwnerRecord,
  contacts: CrmContactRecord,
  companies: CrmCompanyRecord
): ResolvedBoardCard => ({
  deal,
  owner: deal?.ownerId != null ? owners[deal.ownerId] : undefined,
  contact: deal?.contactId != null ? contacts[deal.contactId] : undefined,
  company: deal?.companyId != null ? companies[deal.companyId] : undefined
});
