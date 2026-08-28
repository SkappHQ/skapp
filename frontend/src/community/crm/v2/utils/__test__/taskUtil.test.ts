import {
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealRecord,
  CrmTaskEntity
} from "~community/crm/v2/types/CrmCommonTypes";

import { linkTaskToRelatedEntities } from "../taskUtil";

jest.mock("@rootcodelabs/skapp-ui", () => ({}), { virtual: true });

const companies: CrmCompanyRecord = {
  1: { id: 1, name: "Acme Corp", taskIds: [10, 11] }
};

const contacts: CrmContactRecord = {
  4: { id: 4, firstName: "Dulsara", taskIds: [10] }
};

const deals: CrmDealRecord = {
  7: { id: 7, name: "Renewal", taskIds: [] }
};

describe("linkTaskToRelatedEntities", () => {
  it("appends the task id to every entity the task is linked to", () => {
    const task: CrmTaskEntity = {
      id: 99,
      companyId: 1,
      contactId: 4,
      dealId: 7
    };

    const linked = linkTaskToRelatedEntities(task, companies, contacts, deals);

    expect(linked.companies?.[1].taskIds).toEqual([10, 11, 99]);
    expect(linked.contacts?.[4].taskIds).toEqual([10, 99]);
    expect(linked.deals?.[7].taskIds).toEqual([99]);
  });

  it("touches only the deal when the task has a deal but no contact or company", () => {
    const task: CrmTaskEntity = { id: 99, dealId: 7 };

    const linked = linkTaskToRelatedEntities(task, companies, contacts, deals);

    expect(linked.deals?.[7].taskIds).toEqual([99]);
    expect(linked.companies).toBe(companies);
    expect(linked.contacts).toBe(contacts);
  });

  it("skips a record the caller did not pass", () => {
    const task: CrmTaskEntity = { id: 99, companyId: 1, contactId: 4 };

    const linked = linkTaskToRelatedEntities(task, companies);

    expect(linked.companies?.[1].taskIds).toEqual([10, 11, 99]);
    expect(linked.contacts).toBeUndefined();
  });

  it("starts the array when the entity has not loaded its tasks yet", () => {
    const unloadedCompanies: CrmCompanyRecord = { 1: { id: 1, name: "Acme" } };
    const task: CrmTaskEntity = { id: 99, companyId: 1 };

    const linked = linkTaskToRelatedEntities(
      task,
      unloadedCompanies,
      contacts,
      deals
    );

    expect(linked.companies?.[1].taskIds).toEqual([99]);
  });

  it("does not append the same task id twice", () => {
    const task: CrmTaskEntity = { id: 10, companyId: 1 };

    const linked = linkTaskToRelatedEntities(task, companies);

    expect(linked.companies?.[1].taskIds).toEqual([10, 11]);
  });

  it("leaves records untouched when the linked entity is not in the store", () => {
    const task: CrmTaskEntity = { id: 99, companyId: 42, contactId: 42 };

    const linked = linkTaskToRelatedEntities(task, companies, contacts, deals);

    expect(linked.companies).toBe(companies);
    expect(linked.contacts).toBe(contacts);
  });

  it("leaves records untouched when the response carries no task id", () => {
    const task: CrmTaskEntity = { companyId: 1, contactId: 4, dealId: 7 };

    const linked = linkTaskToRelatedEntities(task, companies, contacts, deals);

    expect(linked.companies).toBe(companies);
    expect(linked.contacts).toBe(contacts);
    expect(linked.deals).toBe(deals);
  });
});
