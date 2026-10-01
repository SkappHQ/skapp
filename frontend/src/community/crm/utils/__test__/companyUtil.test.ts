import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { ADD_NEW_INDUSTRY_OPTION_ID } from "~community/crm/constants/companyConstants";
import {
  CrmCompanyEntity,
  CrmIndustryEntity,
  CrmIndustryRecord
} from "~community/crm/types/CrmCommonTypes";

import {
  addNewIndustryToRecord,
  getChangedCompanyFields,
  getIndustryDisplayName,
  getIndustryOptions,
  removeCompany,
  updateIndustryRecord
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

  it("includes a new industry name", () => {
    const result = getChangedCompanyFields(
      { name: "Acme Corp", industryId: null },
      { name: "Acme Corp", industryId: null, industryName: "Marine" }
    );

    expect(result).toEqual({ industryName: "Marine" });
  });
});

const lookupIndustries: CrmIndustryEntity[] = [
  { id: 1, name: "RETAIL" },
  { id: 2, name: "Deep Sea Tourism" }
];

const getIndustryByName = (name: string): string =>
  name === "RETAIL" ? "Retail" : name;

describe("getIndustryOptions", () => {
  it("lists lookup industries in the order the server returned them", () => {
    const result = getIndustryOptions(lookupIndustries, getIndustryByName);

    expect(result).toEqual([
      { id: "1", name: "Retail" },
      { id: "2", name: "Deep Sea Tourism" }
    ]);
  });

  it("returns no options when the lookup has not loaded", () => {
    expect(getIndustryOptions(undefined, getIndustryByName)).toEqual([]);
  });

  it("offers to add a name that is not in the lookup", () => {
    const result = getIndustryOptions(
      lookupIndustries,
      getIndustryByName,
      " Marine "
    );

    expect(result[result.length - 1]).toEqual({
      id: ADD_NEW_INDUSTRY_OPTION_ID,
      name: "Marine"
    });
  });

  it("does not offer to add a name matching a stored name, ignoring case", () => {
    const result = getIndustryOptions(
      lookupIndustries,
      getIndustryByName,
      "retail"
    );

    expect(result.map((option) => option.id)).toEqual(["1", "2"]);
  });

  it("does not offer to add a name matching a label, ignoring extra spaces", () => {
    const result = getIndustryOptions(
      lookupIndustries,
      getIndustryByName,
      "deep  sea   tourism"
    );

    expect(result.map((option) => option.id)).toEqual(["1", "2"]);
  });

  it("does not offer to add a name longer than the limit", () => {
    const result = getIndustryOptions(
      lookupIndustries,
      getIndustryByName,
      "A".repeat(101)
    );

    expect(result.map((option) => option.id)).toEqual(["1", "2"]);
  });

  it("does not offer to add without a new name", () => {
    const result = getIndustryOptions(lookupIndustries, getIndustryByName, "");

    expect(result.map((option) => option.id)).toEqual(["1", "2"]);
  });
});

describe("updateIndustryRecord", () => {
  it("merges incoming industries into the record", () => {
    const existing: CrmIndustryRecord = { 1: { id: 1, name: "RETAIL" } };

    const result = updateIndustryRecord(existing, [
      { id: 2, name: "Deep Sea Tourism" }
    ]);

    expect(result).toEqual({
      1: { id: 1, name: "RETAIL" },
      2: { id: 2, name: "Deep Sea Tourism" }
    });
  });
});

describe("addNewIndustryToRecord", () => {
  const industries: CrmIndustryRecord = { 1: { id: 1, name: "RETAIL" } };

  it("adds a newly created industry", () => {
    const result = addNewIndustryToRecord(industries, {
      id: 3,
      name: "Deep Sea"
    });

    expect(result[3]).toEqual({ id: 3, name: "Deep Sea" });
  });

  it("keeps the record unchanged when the industry already exists", () => {
    expect(addNewIndustryToRecord(industries, { id: 1, name: "retail" })).toBe(
      industries
    );
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
