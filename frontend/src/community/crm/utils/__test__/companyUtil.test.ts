import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { ADD_NEW_INDUSTRY_OPTION_ID } from "~community/crm/constants/commonConstants";
import {
  CrmCompanyEntity,
  CrmIndustryRecord
} from "~community/crm/types/CrmCommonTypes";

import {
  addNewIndustryToRecord,
  getChangedCompanyFields,
  getCompanyFormInitialValues,
  getIndustryDisplayName,
  getIndustryOptions,
  getTrimmedCompanyValues,
  removeCompany
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

  it("includes a new industry name", () => {
    const result = getChangedCompanyFields(
      { name: "Acme Corp", industryId: null },
      { name: "Acme Corp", industryId: null, industryName: "Marine" }
    );

    expect(result).toEqual({ industryName: "Marine" });
  });
});

describe("getCompanyFormInitialValues", () => {
  it("falls back to blank values and no industry when there is no company", () => {
    expect(getCompanyFormInitialValues()).toEqual({
      name: "",
      industryId: null,
      industryName: undefined,
      website: "",
      address: "",
      contactNumber: ""
    });
  });

  it("keeps the company's industry id", () => {
    expect(
      getCompanyFormInitialValues({ ...acme, industryId: 7 }).industryId
    ).toBe(7);
  });
});

describe("getTrimmedCompanyValues", () => {
  it("trims the text fields and the new industry name", () => {
    const result = getTrimmedCompanyValues({
      name: "  Acme  ",
      industryId: null,
      industryName: "  Marine ",
      website: " https://acme.com ",
      address: " 1 Main St ",
      contactNumber: " 0771234567 "
    });

    expect(result).toEqual({
      name: "Acme",
      industryId: null,
      industryName: "Marine",
      website: "https://acme.com",
      address: "1 Main St",
      contactNumber: "0771234567"
    });
  });

  it("leaves industry name undefined when none was typed", () => {
    expect(getTrimmedCompanyValues({ name: "Acme" }).industryName).toBe(
      undefined
    );
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
  it("returns every industry when there is no search keyword", () => {
    const result = getIndustryOptions(industries, translateText, "", true);

    expect(result.map((option) => option.id)).toEqual(["1", "2"]);
  });

  it("filters by the search keyword, ignoring case", () => {
    const result = getIndustryOptions(industries, translateText, "deep", true);

    expect(result).toEqual([
      { id: "2", name: "Deep Sea Tourism" },
      { id: ADD_NEW_INDUSTRY_OPTION_ID, name: "deep" }
    ]);
  });

  it("does not offer to add a name that already exists", () => {
    const result = getIndustryOptions(
      industries,
      translateText,
      " deep sea tourism ",
      true
    );

    expect(result).toEqual([{ id: "2", name: "Deep Sea Tourism" }]);
  });

  it("does not offer to add when adding is not allowed", () => {
    const result = getIndustryOptions(
      industries,
      translateText,
      "Marine",
      false
    );

    expect(result).toEqual([]);
  });

  it("does not offer to add a name longer than the limit", () => {
    const result = getIndustryOptions(
      industries,
      translateText,
      "A".repeat(101),
      true
    );

    expect(result).toEqual([]);
  });
});

describe("addNewIndustryToRecord", () => {
  it("adds a newly created industry", () => {
    const result = addNewIndustryToRecord(industries, 3, "Marine");

    expect(result[3]).toEqual({ id: 3, name: "Marine" });
  });

  it("keeps the record unchanged when the industry already exists", () => {
    expect(addNewIndustryToRecord(industries, 1, "retail")).toBe(industries);
  });

  it("keeps the record unchanged when no new name was sent", () => {
    expect(addNewIndustryToRecord(industries, 3, undefined)).toBe(industries);
  });

  it("keeps the record unchanged when there is no industry id", () => {
    expect(addNewIndustryToRecord(industries, null, "Marine")).toBe(industries);
  });
});

describe("removeCompany", () => {
  it("drops the company from both the record and the id array", () => {
    const result = removeCompany({ 1: acme, 2: globex }, [1, 2], 1);

    expect(result.companyIds).toEqual([2]);
    expect(result.companies[1]).toBeUndefined();
  });
});
