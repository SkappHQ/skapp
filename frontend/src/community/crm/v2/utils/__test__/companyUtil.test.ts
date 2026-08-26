import { CrmIndustryEnum } from "~community/crm/v2/enums/common";
import {
  CrmCompanyEntity,
  CrmCompanyRecord
} from "~community/crm/v2/types/CrmCommonTypes";

import {
  getChangedCompanyFields,
  getCompanyFormInitialValues,
  getCompanyMetricItems,
  getSelectedCompany,
  getTrimmedCompanyValues,
  normalizeCompanies,
  removeCompany,
  updateCompany
} from "../companyUtil";

const mockTranslateText = (keys: string[]): string => keys.join(".");

const acme: CrmCompanyEntity = {
  id: 1,
  name: "Acme Corp",
  industry: CrmIndustryEnum.TECHNOLOGY_INFORMATION_AND_MEDIA,
  website: "https://acme.com",
  address: "122 Main Street",
  contactNumber: "94771234567",
  metrics: {
    openTasksCount: 1,
    overdueTasksCount: 0,
    openValue: "14700000.00",
    accountValue: "5000000.00",
    openDealsCount: 23,
    closedDealsCount: 2
  }
};

const globex: CrmCompanyEntity = { id: 2, name: "Globex" };

describe("normalizeCompanies", () => {
  it("keys companies by id and preserves order in the id array", () => {
    const result = normalizeCompanies([acme, globex]);

    expect(result.companyIds).toEqual([1, 2]);
    expect(result.companies[1].name).toBe("Acme Corp");
    expect(result.companies[2].name).toBe("Globex");
  });

  it("skips companies without an id", () => {
    const result = normalizeCompanies([acme, { name: "No Id" }]);

    expect(result.companyIds).toEqual([1]);
    expect(Object.keys(result.companies)).toHaveLength(1);
  });

  it("returns empty collections for an empty list", () => {
    const result = normalizeCompanies([]);

    expect(result.companyIds).toEqual([]);
    expect(result.companies).toEqual({});
  });
});

describe("updateCompany", () => {
  const companies: CrmCompanyRecord = { 1: acme };

  it("merges the given fields over the existing company", () => {
    const result = updateCompany(companies, 1, { name: "Acme Renamed" });

    expect(result[1].name).toBe("Acme Renamed");
  });

  it("keeps fields the update did not mention", () => {
    const result = updateCompany(companies, 1, { name: "Acme Renamed" });

    expect(result[1].metrics?.openDealsCount).toBe(23);
    expect(result[1].website).toBe("https://acme.com");
  });

  it("does not mutate the original record", () => {
    updateCompany(companies, 1, { name: "Acme Renamed" });

    expect(companies[1].name).toBe("Acme Corp");
  });
});

describe("removeCompany", () => {
  it("removes the company from both the record and the id array", () => {
    const result = removeCompany({ 1: acme, 2: globex }, [1, 2], 1);

    expect(result.companyIds).toEqual([2]);
    expect(result.companies[1]).toBeUndefined();
    expect(result.companies[2]).toBeDefined();
  });

  it("does not mutate the original record", () => {
    const companies: CrmCompanyRecord = { 1: acme, 2: globex };

    removeCompany(companies, [1, 2], 1);

    expect(companies[1]).toBeDefined();
  });
});

describe("getSelectedCompany", () => {
  it("returns undefined when nothing is selected", () => {
    expect(getSelectedCompany({ 1: acme }, null)).toBeUndefined();
  });

  it("returns the selected company", () => {
    expect(getSelectedCompany({ 1: acme }, 1)?.name).toBe("Acme Corp");
  });
});

describe("getCompanyFormInitialValues", () => {
  it("falls back to blank values when there is no company", () => {
    const result = getCompanyFormInitialValues();

    expect(result.name).toBe("");
    expect(result.industry).toBe(CrmIndustryEnum.NONE);
  });

  it("maps an existing company onto the form values", () => {
    const result = getCompanyFormInitialValues(acme);

    expect(result.name).toBe("Acme Corp");
    expect(result.website).toBe("https://acme.com");
  });
});

describe("getTrimmedCompanyValues", () => {
  it("trims the text fields", () => {
    const result = getTrimmedCompanyValues({
      name: "  Acme Corp  ",
      website: "  https://acme.com  ",
      address: "  122 Main Street  ",
      contactNumber: "  94771234567  "
    });

    expect(result.name).toBe("Acme Corp");
    expect(result.website).toBe("https://acme.com");
    expect(result.address).toBe("122 Main Street");
    expect(result.contactNumber).toBe("94771234567");
  });
});

describe("getChangedCompanyFields", () => {
  it("returns only the fields that changed", () => {
    const result = getChangedCompanyFields(
      { name: "Acme Corp", website: "https://acme.com" },
      { name: "Acme Renamed", website: "https://acme.com" }
    );

    expect(result).toEqual({ name: "Acme Renamed" });
  });

  it("returns an empty object when nothing changed", () => {
    const result = getChangedCompanyFields(
      { name: "Acme Corp" },
      { name: "Acme Corp" }
    );

    expect(result).toEqual({});
  });
});

describe("getCompanyMetricItems", () => {
  it("returns the three metric cards in order", () => {
    const result = getCompanyMetricItems(acme, mockTranslateText);

    expect(result.map((metric) => metric.id)).toEqual([
      "accountValue",
      "openDeals",
      "closedDeals"
    ]);
  });

  it("marks only the account value as currency", () => {
    const result = getCompanyMetricItems(acme, mockTranslateText);

    expect(result[0].isCurrency).toBe(true);
    expect(result[1].isCurrency).toBeUndefined();
  });

  it("reads the amounts from the nested metrics object", () => {
    const result = getCompanyMetricItems(acme, mockTranslateText);

    expect(result[0].amount).toBe("5000000.00");
    expect(result[1].amount).toBe(23);
    expect(result[2].amount).toBe(2);
  });
});
