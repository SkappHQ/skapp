import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import {
  CrmCompanyEntity,
  CrmIndustryRecord
} from "~community/crm/types/CrmCommonTypes";

import {
  getChangedCompanyFields,
  getIndustryDisplayName,
  getIndustryOptions,
  removeCompany,
  toIndustryId,
  toIndustryOptionValue
} from "../companyUtil";

const acme: CrmCompanyEntity = { id: 1, name: "Acme Corp" };
const globex: CrmCompanyEntity = { id: 2, name: "Globex" };

const translateText: TranslatorFunctionType = (suffixes: string[]): string =>
  suffixes.join(".");

const industries: CrmIndustryRecord = {
  1: { id: 1, name: "RETAIL" },
  2: { id: 2, name: "Deep Sea Tourism" }
};

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
    expect(getIndustryDisplayName(industries[1], translateText)).toBe(
      "companies.industryOptions.retail"
    );
  });

  it("shows a custom industry name as is", () => {
    expect(getIndustryDisplayName(industries[2], translateText)).toBe(
      "Deep Sea Tourism"
    );
  });
});

describe("getIndustryOptions", () => {
  it("lists None first, then every industry from the store", () => {
    const result = getIndustryOptions(industries, translateText);

    expect(result).toEqual([
      {
        id: CrmIndustryEnum.NONE,
        value: CrmIndustryEnum.NONE,
        label: "companies.industryOptions.none"
      },
      { id: "1", value: "1", label: "companies.industryOptions.retail" },
      { id: "2", value: "2", label: "Deep Sea Tourism" }
    ]);
  });
});

describe("toIndustryOptionValue", () => {
  it("maps no industry to the None option", () => {
    expect(toIndustryOptionValue(null)).toBe(CrmIndustryEnum.NONE);
    expect(toIndustryOptionValue(undefined)).toBe(CrmIndustryEnum.NONE);
  });

  it("maps an industry id to its option value", () => {
    expect(toIndustryOptionValue(2)).toBe("2");
  });
});

describe("toIndustryId", () => {
  it("maps the None option to null", () => {
    expect(toIndustryId(CrmIndustryEnum.NONE)).toBeNull();
  });

  it("maps an option value back to its industry id", () => {
    expect(toIndustryId("2")).toBe(2);
  });
});

describe("removeCompany", () => {
  it("drops the company from both the record and the id array", () => {
    const result = removeCompany({ 1: acme, 2: globex }, [1, 2], 1);

    expect(result.companyIds).toEqual([2]);
    expect(result.companies[1]).toBeUndefined();
  });
});
