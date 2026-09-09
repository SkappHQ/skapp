import { CrmIndustryEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  findMatchingIndustry,
  normalizeIndustryName
} from "~community/crm/v2/utils/industryUtil";

describe("normalizeIndustryName", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeIndustryName("   Retail   ")).toBe("Retail");
  });

  it("collapses repeated internal whitespace to a single space", () => {
    expect(normalizeIndustryName("Real     Estate")).toBe("Real Estate");
  });

  it("collapses tabs and newlines between words", () => {
    expect(normalizeIndustryName("Oil\tGas\nAnd  Mining")).toBe(
      "Oil Gas And Mining"
    );
  });

  it("leaves an already normalized name unchanged", () => {
    expect(normalizeIndustryName("Financial Services")).toBe(
      "Financial Services"
    );
  });

  it("preserves casing", () => {
    expect(normalizeIndustryName("  eCommerce   & B2B ")).toBe(
      "eCommerce & B2B"
    );
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(normalizeIndustryName("    ")).toBe("");
  });
});

describe("findMatchingIndustry", () => {
  const industries: CrmIndustryEntity[] = [
    { id: 1, name: "Retail" },
    { id: 2, name: "Real Estate" },
    { id: 3, name: "Financial Services" }
  ];

  it("matches ignoring case", () => {
    expect(findMatchingIndustry(industries, "rETAIL")).toEqual({
      id: 1,
      name: "Retail"
    });
  });

  it("matches ignoring surrounding whitespace", () => {
    expect(findMatchingIndustry(industries, "  Retail  ")).toEqual({
      id: 1,
      name: "Retail"
    });
  });

  it("matches when internal whitespace differs", () => {
    expect(findMatchingIndustry(industries, "Real    Estate")).toEqual({
      id: 2,
      name: "Real Estate"
    });
  });

  it("returns undefined when nothing matches", () => {
    expect(
      findMatchingIndustry(industries, "Renewable Energy")
    ).toBeUndefined();
  });

  it("does not match on a partial name", () => {
    expect(findMatchingIndustry(industries, "Financial")).toBeUndefined();
  });

  it("returns undefined for an empty list", () => {
    expect(findMatchingIndustry([], "Retail")).toBeUndefined();
  });
});
