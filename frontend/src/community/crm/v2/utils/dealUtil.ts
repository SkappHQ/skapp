import { CrmDealStageEnum } from "../enums/common";
import {
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmStageRecord
} from "../types/CrmCommonTypes";
import { appendId } from "./commonUtil";

export const toDealIds = (deals: CrmDealEntity[]): number[] => {
  const dealIds: number[] = [];
  for (const deal of deals) {
    if (deal.id != null) {
      dealIds.push(deal.id);
    }
  }
  return dealIds;
};

export const mergeDeals = (
  existing: CrmDealRecord,
  incoming: CrmDealEntity[]
): CrmDealRecord => {
  const merged: CrmDealRecord = { ...existing };
  for (const deal of incoming) {
    if (deal.id == null) continue;
    merged[deal.id] = { ...merged[deal.id], ...deal };
  }
  return merged;
};

export const removeDealId = (dealIds: number[], id: number): number[] =>
  dealIds.filter((dealId) => dealId !== id);

export const removeDealFromRecord = (
  deals: CrmDealRecord,
  id: number
): CrmDealRecord => {
  if (!(id in deals)) return deals;
  const next = { ...deals };
  delete next[id];
  return next;
};

export const resolveDeals = (
  dealIds: number[],
  deals: CrmDealRecord
): CrmDealEntity[] =>
  dealIds
    .map((id) => deals[id])
    .filter((deal): deal is CrmDealEntity => Boolean(deal));

export const getDealNameById = (deals: CrmDealRecord, dealId?: number) => {
  if (dealId !== undefined) {
    return deals[dealId].name;
  }
};

export const linkDealToRelatedEntities = (
  deal: CrmDealEntity,
  companies?: CrmCompanyRecord,
  contacts?: CrmContactRecord
) => {
  const dealId = deal.id;
  const linked = { companies, contacts };

  if (dealId === undefined) {
    return linked;
  }

  if (companies !== undefined && deal.companyId !== undefined) {
    const company = companies[deal.companyId];

    if (company !== undefined) {
      linked.companies = {
        ...companies,
        [deal.companyId]: {
          ...company,
          dealIds: appendId(company.dealIds, dealId)
        }
      };
    }
  }

  if (contacts !== undefined && deal.contactId !== undefined) {
    const contact = contacts[deal.contactId];

    if (contact !== undefined) {
      linked.contacts = {
        ...contacts,
        [deal.contactId]: {
          ...contact,
          dealIds: appendId(contact.dealIds, dealId)
        }
      };
    }
  }

  return linked;
};

export const getInitialStageId = (stages: CrmStageRecord) =>
  Object.values(stages).find(
    (stage) => stage.stageType === CrmDealStageEnum.INITIAL
  )?.id;
