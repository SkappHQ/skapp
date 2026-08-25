import { CrmDealStageEnum } from "../enums/common";
import {
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmStageRecord
} from "../types/CrmCommonTypes";

export const toDealsRecord = (deals: CrmDealEntity[]): CrmDealRecord => {
  const dealRecord: CrmDealRecord = {};
  for (const deal of deals) {
    if (deal.id != null) {
      dealRecord[deal.id] = deal;
    }
  }
  return dealRecord;
};

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

export const appendDealId = (dealIds: number[], id: number): number[] =>
  dealIds.includes(id) ? dealIds : [...dealIds, id];

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

export interface CrmDealRelatedRecords {
  companies: CrmCompanyRecord;
  contacts: CrmContactRecord;
}

export const linkDealToRelatedEntities = (
  deal: CrmDealEntity,
  records: CrmDealRelatedRecords
): CrmDealRelatedRecords => {
  const dealId = deal.id;

  if (dealId === undefined) {
    return records;
  }

  const linked: CrmDealRelatedRecords = { ...records };

  if (deal.companyId !== undefined) {
    const company = records.companies[deal.companyId];

    if (company?.dealIds !== undefined) {
      linked.companies = {
        ...records.companies,
        [deal.companyId]: {
          ...company,
          dealIds: appendDealId(company.dealIds, dealId)
        }
      };
    }
  }

  if (deal.contactId !== undefined) {
    const contact = records.contacts[deal.contactId];

    if (contact?.dealIds !== undefined) {
      linked.contacts = {
        ...records.contacts,
        [deal.contactId]: {
          ...contact,
          dealIds: appendDealId(contact.dealIds, dealId)
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
