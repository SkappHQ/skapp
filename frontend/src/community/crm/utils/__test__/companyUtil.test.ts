import { CrmIndustryEnum } from "~community/crm/enums/common";
import { CrmCompany } from "~community/crm/types/CommonTypes";

import {
  mapCompanyToMetricItems,
  withIncrementedOpenDeals
} from "../companyUtil";

const mockTranslateText = (keys: string[]): string => keys.join(".");

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

describe("withIncrementedOpenDeals", () => {
  const companyA: CrmCompany = { ...baseCompany, id: 1, openDeals: 4 };
  const companyB: CrmCompany = { ...baseCompany, id: 2, openDeals: 9 };

  it("should increment openDeals by 1 for the matching company", () => {
    const result = withIncrementedOpenDeals([companyA, companyB], 1);

    expect(result[0].openDeals).toBe(5);
  });

  it("should treat a null openDeals as 0 and set it to 1", () => {
    const companyWithNull: CrmCompany = {
      ...baseCompany,
      id: 3,
      openDeals: null
    };

    const result = withIncrementedOpenDeals([companyWithNull], 3);

    expect(result[0].openDeals).toBe(1);
  });

  it("should leave non-matching companies unchanged", () => {
    const result = withIncrementedOpenDeals([companyA, companyB], 1);

    expect(result[1]).toBe(companyB);
    expect(result[1].openDeals).toBe(9);
  });

  it("should return a new array and not mutate the input", () => {
    const input = [companyA, companyB];
    const result = withIncrementedOpenDeals(input, 1);

    expect(result).not.toBe(input);
    expect(companyA.openDeals).toBe(4);
  });
});
