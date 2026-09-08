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

export const getMissingDealIds = (
  dealIds: number[],
  deals: CrmDealRecord
): number[] => {
  const unique = new Set<number>();
  for (const id of dealIds) {
    if (!deals[id]) unique.add(id);
  }
  return Array.from(unique);
};

export const updateDealRecord = (
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

export interface CrmDealLinks {
  companies?: CrmCompanyRecord;
  contacts?: CrmContactRecord;
}

export const linkDealToRelatedEntities = (
  deal: CrmDealEntity,
  companies?: CrmCompanyRecord,
  contacts?: CrmContactRecord
): CrmDealLinks => {
  const dealId = deal.id;
  const linked: CrmDealLinks = { companies, contacts };

  if (dealId === undefined) {
    return linked;
  }

  if (companies !== undefined && deal.companyId !== undefined) {
    const company = companies[deal.companyId];

    if (company?.dealIds !== undefined) {
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

    if (contact?.dealIds !== undefined) {
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

export const getInitialStageId = (stages: CrmStageRecord): number | undefined =>
  Object.values(stages).find(
    (stage) => stage.stageType === CrmDealStageEnum.INITIAL
  )?.id;

export const reorderDealIds = (
  dealIds: number[],
  movedDealId: number,
  previousDealId: number | null,
  nextDealId: number | null
): number[] => {
  const rest = dealIds.filter((id) => id !== movedDealId);

  const previousIndex =
    previousDealId == null ? -1 : rest.indexOf(previousDealId);
  const nextIndex = nextDealId == null ? -1 : rest.indexOf(nextDealId);

  let insertAt: number;
  if (previousIndex !== -1) {
    insertAt = previousIndex + 1;
  } else if (nextIndex !== -1) {
    insertAt = nextIndex;
  } else {
    insertAt = previousDealId == null ? 0 : rest.length;
  }

  return [...rest.slice(0, insertAt), movedDealId, ...rest.slice(insertAt)];
};
