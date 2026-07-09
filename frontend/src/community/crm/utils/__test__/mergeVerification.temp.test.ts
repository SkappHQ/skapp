import { CrmIndustryEnum, CrmPriorityEnum } from "~community/crm/enums/common";
import {
  CrmCompanyDetailType,
  CrmContact,
  CrmTaskDetailType
} from "~community/crm/types/CommonTypes";
import { mergeCompanyUpdate } from "~community/crm/utils/companyUtil";
import { mergeContactUpdate } from "~community/crm/utils/contactUtil";
import { mergeTaskUpdate } from "~community/crm/utils/taskUtil";

const owner = { employeeId: 1, firstName: "A", lastName: "B", authPic: null };

describe("mergeContactUpdate (updateContact store action)", () => {
  it("replaces the matching contact with the full fetched object, leaves others untouched", () => {
    const untouched: CrmContact = {
      id: 2,
      name: "Other Contact",
      email: "other@x.com",
      contactNumber: null,
      company: null,
      owner
    };
    const original: CrmContact = {
      id: 1,
      name: "Old Name",
      email: "old@x.com",
      contactNumber: "111",
      company: null,
      owner,
      openTasksCount: 1
    };
    const fresh: CrmContact = {
      id: 1,
      name: "New Name",
      email: "new@x.com",
      contactNumber: "222",
      company: null,
      owner,
      openTasksCount: 5,
      overdueTasksCount: 2
    };

    const result = mergeContactUpdate([original, untouched], fresh);

    expect(result.find((c) => c.id === 1)).toEqual(fresh);
    expect(result.find((c) => c.id === 2)).toEqual(untouched);
  });
});

describe("mergeTaskUpdate (updateTask store action)", () => {
  it("replaces the matching task with the full fetched object, leaves others untouched", () => {
    const untouched: CrmTaskDetailType = {
      id: 2,
      name: "Other Task",
      typeId: 1,
      typeName: "Call",
      priority: CrmPriorityEnum.LOW,
      isCompleted: false,
      dueAt: null,
      notes: null,
      contactId: null,
      owner,
      contact: null,
      deal: null
    };
    const original: CrmTaskDetailType = {
      id: 1,
      name: "Old Task",
      typeId: 1,
      typeName: "Call",
      priority: CrmPriorityEnum.LOW,
      isCompleted: false,
      dueAt: null,
      notes: "old notes",
      contactId: null,
      owner,
      contact: null,
      deal: null
    };
    const fresh: CrmTaskDetailType = {
      ...original,
      name: "Updated Task",
      isCompleted: true,
      notes: "new notes"
    };

    const result = mergeTaskUpdate([original, untouched], fresh);

    expect(result.find((t) => t.id === 1)).toEqual(fresh);
    expect(result.find((t) => t.id === 2)).toEqual(untouched);
  });
});

describe("mergeCompanyUpdate (updateCompany store action, the genuine-partial case)", () => {
  it("merges only tasks/deals/contacts, leaves name/industry/website/address untouched", () => {
    const original: CrmCompanyDetailType = {
      id: 1,
      name: "Acme Corp",
      contactNumber: "555",
      industry: CrmIndustryEnum.TECHNOLOGY,
      website: "https://acme.example",
      address: "123 Main St",
      openTaskCount: 0,
      overdue: 0,
      openValue: "0",
      accountValue: "0",
      closedDeals: 0,
      openDeals: 0
      // tasks/deals/contacts intentionally absent, as when loaded from the list view
    };

    const relationsUpdate = {
      id: 1,
      tasks: [] as CrmTaskDetailType[],
      deals: [],
      contacts: [] as CrmContact[]
    };

    const result = mergeCompanyUpdate([original], relationsUpdate);
    const merged = result.find((c) => c.id === 1)!;

    // The fields CompanySidePanel never sends must survive untouched
    expect(merged.name).toBe("Acme Corp");
    expect(merged.industry).toBe(CrmIndustryEnum.TECHNOLOGY);
    expect(merged.website).toBe("https://acme.example");
    expect(merged.address).toBe("123 Main St");
    // The fields it does send must be applied
    expect(merged.tasks).toEqual([]);
    expect(merged.deals).toEqual([]);
    expect(merged.contacts).toEqual([]);
  });
});
