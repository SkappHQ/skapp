import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmCompanyEntity } from "~community/crm/types/CrmCommonTypes";

import {
  getChangedCompanyFields,
  getIndustryDisplayName,
  removeCompany
} from "../companyUtil";

const acme: CrmCompanyEntity = { id: 1, name: "Acme Corp" };
const globex: CrmCompanyEntity = { id: 2, name: "Globex" };

const translateIndustryName: TranslatorFunctionType = (
  suffixes: string[]
): string => `industryOptions.${suffixes.join(".")}`;

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

  it("includes a changed industry id", () => {
    const result = getChangedCompanyFields(
      { name: "Acme Corp", industryId: 1 },
      { name: "Acme Corp", industryId: 2 }
    );

    expect(result).toEqual({ industryId: 2 });
  });

  it("includes a cleared industry id as null", () => {
    const result = getChangedCompanyFields(
      { name: "Acme Corp", industryId: 1 },
      { name: "Acme Corp", industryId: null }
    );

    expect(result).toEqual({ industryId: null });
  });
});

describe("getIndustryDisplayName", () => {
  it("translates a seeded industry name", () => {
    expect(getIndustryDisplayName("RETAIL", translateIndustryName)).toBe(
      "industryOptions.retail"
    );
  });

  it("translates a multi-word seeded industry name with its camelCase key", () => {
    expect(
      getIndustryDisplayName("HOSPITALS_AND_HEALTH_CARE", translateIndustryName)
    ).toBe("industryOptions.hospitalsAndHealthCare");
  });

  it("shows a custom industry name as is", () => {
    expect(
      getIndustryDisplayName("Deep Sea Tourism", translateIndustryName)
    ).toBe("Deep Sea Tourism");
  });
});

describe("removeCompany", () => {
  it("drops the company from both the record and the id array", () => {
    const result = removeCompany({ 1: acme, 2: globex }, [1, 2], 1);

    expect(result.companyIds).toEqual([2]);
    expect(result.companies[1]).toBeUndefined();
  });
});
