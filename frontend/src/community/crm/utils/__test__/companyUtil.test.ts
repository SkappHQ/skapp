import {
  CrmIndustryEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import { CrmCompany, CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import {
  mapCompanyToMetricItems,
  updateCompanyTaskCompletion
} from "../companyUtil";

const mockTranslateText = (keys: string[]): string => keys.join(".");

const owner = {
  employeeId: 1,
  firstName: "Owner",
  lastName: "User",
  authPic: null
};

const makeCompanyTask = (
  id: number,
  isCompleted: boolean,
  companyId: number | null
): CrmTaskDetailType => ({
  id,
  name: `Task ${id}`,
  typeId: 1,
  typeName: "CALL",
  priority: CrmPriorityEnum.MEDIUM,
  isCompleted,
  dueAt: null,
  notes: null,
  contactId: 10,
  owner,
  contact:
    companyId == null
      ? null
      : { id: 10, name: "Contact", company: { id: companyId, name: "Co" } },
  deal: null
});

const baseCompany: CrmCompany = {
  id: 1,
  name: "Test Company",
  contactNumber: "1234567890",
  industry: CrmIndustryEnum.ACCOMMODATION_SERVICES,
  website: "https://www.testcompany.com",
  address: "123 Test St, Test City, TC 12345",
  openTasksCount: 5,
  overdue: 2,
  openValue: "50000",
  accountValue: "100000",
  openDeals: 4,
  closedDeals: 7,
  tasks: null,
  deals: null,
  contacts: null
};

describe("mapCompanyToMetricItems", () => {
  it("should return 3 metric items in the correct order", () => {
    const result = mapCompanyToMetricItems(baseCompany, mockTranslateText);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("accountValue");
    expect(result[1].id).toBe("openDeals");
    expect(result[2].id).toBe("closedDeals");
  });

  it("should mark accountValue as currency", () => {
    const result = mapCompanyToMetricItems(baseCompany, mockTranslateText);

    expect(result[0].isCurrency).toBe(true);
  });

  it("should not mark deal counts as currency", () => {
    const result = mapCompanyToMetricItems(baseCompany, mockTranslateText);

    expect(result[1].isCurrency).toBeFalsy();
    expect(result[2].isCurrency).toBeFalsy();
  });

  it("should convert all values to strings", () => {
    const result = mapCompanyToMetricItems(baseCompany, mockTranslateText);

    expect(result[0].amount).toBe("100000");
    expect(result[1].amount).toBe("4");
    expect(result[2].amount).toBe("7");
  });
});

describe("updateCompanyTaskCompletion", () => {
  const companyWithTasks: CrmCompany = {
    ...baseCompany,
    id: 1,
    openTasksCount: 2,
    tasks: [makeCompanyTask(1, false, 1), makeCompanyTask(2, false, 1)]
  };

  it("flips the matching task and recomputes openTasksCount", () => {
    const result = updateCompanyTaskCompletion([companyWithTasks], 1, 1, true);

    expect(result[0].tasks?.find((task) => task.id === 1)?.isCompleted).toBe(
      true
    );
    expect(result[0].openTasksCount).toBe(1);
  });

  it("leaves companies without loaded tasks untouched", () => {
    const companyNoTasks: CrmCompany = { ...baseCompany, id: 1, tasks: null };
    const result = updateCompanyTaskCompletion([companyNoTasks], 1, 1, true);

    expect(result[0]).toBe(companyNoTasks);
  });
});
