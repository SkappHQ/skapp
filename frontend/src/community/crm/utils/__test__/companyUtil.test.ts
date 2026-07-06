import { CrmIndustryEnum } from "~community/crm/enums/common";
import { CrmCompanyDetailType } from "~community/crm/types/CommonTypes";

import { mapCompanyToMetricItems } from "../companyUtil";

const mockTranslateText = (keys: string[]): string => keys.join(".");

const baseCompany: CrmCompanyDetailType = {
  id: 1,
  name: "Test Company",
  contactNumber: "1234567890",
  industry: CrmIndustryEnum.ACCOMMODATION_SERVICES,
  website: "https://www.testcompany.com",
  address: "123 Test St, Test City, TC 12345",
  overdue: 2,
  openValue: "50000",
  accountValue: "100000",
  openDeals: 4,
  closedDeals: 7
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
