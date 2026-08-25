import { CrmDealStageEnum } from "~community/crm/v2/enums/common";
import {
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealEntity,
  CrmStageRecord
} from "~community/crm/v2/types/CrmCommonTypes";

import { getInitialStageId, linkDealToRelatedEntities } from "../dealUtil";

const stages: CrmStageRecord = {
  1: { id: 1, name: "LEAD", stageType: CrmDealStageEnum.INITIAL },
  2: { id: 2, name: "NEGOTIATION", stageType: CrmDealStageEnum.OPEN }
};

describe("getInitialStageId", () => {
  it("returns the id of the INITIAL stage", () => {
    expect(getInitialStageId(stages)).toBe(1);
  });

  it("returns undefined before the stages have loaded", () => {
    expect(getInitialStageId({})).toBeUndefined();
  });
});

describe("linkDealToRelatedEntities", () => {
  const companies: CrmCompanyRecord = { 1: { id: 1, dealIds: [7] } };
  const contacts: CrmContactRecord = { 4: { id: 4, dealIds: [] } };

  it("appends the deal id to every entity it is linked to", () => {
    const deal: CrmDealEntity = { id: 9, companyId: 1, contactId: 4 };

    const linked = linkDealToRelatedEntities(deal, { companies, contacts });

    expect(linked.companies[1].dealIds).toEqual([7, 9]);
    expect(linked.contacts[4].dealIds).toEqual([9]);
  });

  it("leaves an entity alone when its deals were never loaded", () => {
    const unloaded: CrmCompanyRecord = { 1: { id: 1 } };
    const deal: CrmDealEntity = { id: 9, companyId: 1 };

    const linked = linkDealToRelatedEntities(deal, {
      companies: unloaded,
      contacts
    });

    expect(linked.companies).toBe(unloaded);
  });
});
