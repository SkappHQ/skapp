import {
  CrmMetricLabelThemeEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import {
  CompanyLookup,
  CrmContact,
  TaskRowResponseType
} from "~community/crm/types/CommonTypes";

import {
  mapContactToMetricItems,
  mergeAndPrioritizeCompanyDropdownItems,
  updateContactTaskCompletion
} from "../contactUtil";

const mockTranslateText = (keys: string[]): string => keys.join(".");

const toCompanyLookup = (id: number, name: string): CompanyLookup => ({
  id,
  name
});

const baseContact: CrmContact = {
  id: 1,
  name: "Test Contact",
  email: "test@example.com",
  contactNumber: "0711234567",
  lastContactAt: null,
  lastModifiedDate: "2026-06-01T00:00:00",
  company: null,
  owner: {
    employeeId: 1,
    firstName: "Owner",
    lastName: "User",
    authPic: null
  },
  closedDealValue: null,
  closedDealCount: null,
  openTasksCount: 5,
  overdueTasksCount: 0,
  activeDealsCount: 3,
  totalRevenue: "45000.00",
  pipelineRevenue: "20000.00",
  tasks: [],
  deals: []
};

describe("mapContactToMetricItems", () => {
  it("should return 4 metric items in the correct order", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe("openTasksCount");
    expect(result[1].id).toBe("activeDealsCount");
    expect(result[2].id).toBe("totalRevenue");
    expect(result[3].id).toBe("pipelineRevenue");
  });

  it("should not include a chip when overdueTasksCount is 0", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[0].chip).toBeUndefined();
  });

  it("should include a RED chip with interpolated count when overdueTasksCount > 0", () => {
    const contact = { ...baseContact, overdueTasksCount: 2 };
    const translateWithTemplate = (keys: string[]): string =>
      keys.join(".") === "metrics.overdueChipLabel"
        ? "{{count}} Overdue"
        : keys.join(".");
    const result = mapContactToMetricItems(contact, translateWithTemplate);

    expect(result[0].chip).toBeDefined();
    expect(result[0].chip?.variant).toBe(CrmMetricLabelThemeEnum.RED);
    expect(result[0].chip?.label).toBe("2 Overdue");
  });

  it("should mark totalRevenue and pipelineRevenue as currency", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[2].isCurrency).toBe(true);
    expect(result[3].isCurrency).toBe(true);
  });

  it("should not mark count-based metrics as currency", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[0].isCurrency).toBeFalsy();
    expect(result[1].isCurrency).toBeFalsy();
  });

  it("should convert count values to strings for the amount field", () => {
    const contact = { ...baseContact, openTasksCount: 7, activeDealsCount: 4 };
    const result = mapContactToMetricItems(contact, mockTranslateText);

    expect(result[0].amount).toBe("7");
    expect(result[1].amount).toBe("4");
  });

  it("should use the revenue strings from the API directly", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[2].amount).toBe("45000.00");
    expect(result[3].amount).toBe("20000.00");
  });
});

describe("updateContactTaskCompletion", () => {
  const makeTask = (
    id: number,
    isCompleted: boolean
  ): TaskRowResponseType => ({
    id,
    name: `Task ${id}`,
    typeName: "Call",
    priority: CrmPriorityEnum.MEDIUM,
    isCompleted,
    dueAt: null,
    owner: baseContact.owner,
    contact: null
  });

  const contactWithTasks: CrmContact = {
    ...baseContact,
    openTasksCount: 2,
    tasks: [makeTask(1, false), makeTask(2, false), makeTask(3, true)]
  };

  it("flips the matching task and recomputes openTasksCount from remaining open tasks", () => {
    const result = updateContactTaskCompletion([contactWithTasks], 1, 1, true);

    expect(result[0].tasks?.find((task) => task.id === 1)?.isCompleted).toBe(
      true
    );
    expect(result[0].openTasksCount).toBe(1);
  });

  it("leaves non-matching contacts untouched", () => {
    const other: CrmContact = { ...contactWithTasks, id: 99 };
    const result = updateContactTaskCompletion([other], 1, 1, true);

    expect(result[0]).toBe(other);
  });

  it("returns the contact unchanged when it has no loaded tasks", () => {
    const contactNoTasks: CrmContact = { ...baseContact, tasks: null };
    const result = updateContactTaskCompletion([contactNoTasks], 1, 1, true);

    expect(result[0]).toBe(contactNoTasks);
  });
});

describe("mergeAndPrioritizeCompanyDropdownItems", () => {
  it("should return domain-matched companies first and flag them as prioritized", () => {
    const lookupCompanies = [
      toCompanyLookup(1, "Lookup Only Co"),
      toCompanyLookup(2, "Domain Match Co")
    ];
    const domainCompanies = [toCompanyLookup(2, "Domain Match Co")];

    const result = mergeAndPrioritizeCompanyDropdownItems(
      lookupCompanies,
      domainCompanies
    );

    expect(result[0].id).toBe("2");
    expect(result[0].isPrioritized).toBe(true);
    expect(result[1].id).toBe("1");
  });

  it("should not flag lookup-only companies as prioritized", () => {
    const lookupCompanies = [toCompanyLookup(1, "Lookup Only Co")];

    const result = mergeAndPrioritizeCompanyDropdownItems(
      lookupCompanies,
      undefined
    );

    expect(result).toHaveLength(1);
    expect(result[0].isPrioritized).toBeUndefined();
  });

  it("should de-duplicate a company present in both lists while keeping it prioritized", () => {
    const lookupCompanies = [toCompanyLookup(1, "Shared Co")];
    const domainCompanies = [toCompanyLookup(1, "Shared Co")];

    const result = mergeAndPrioritizeCompanyDropdownItems(
      lookupCompanies,
      domainCompanies
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
    expect(result[0].isPrioritized).toBe(true);
  });

  it("should return an empty array when both sources are undefined", () => {
    const result = mergeAndPrioritizeCompanyDropdownItems(undefined, undefined);

    expect(result).toEqual([]);
  });
});
