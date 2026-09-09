import { CrmIndustryEntity } from "~community/crm/v2/types/CrmCommonTypes";

/**
 * Normalizes an industry name for comparison: trims the ends and collapses runs of
 * internal whitespace to a single space. Mirrors the server-side normalization so
 * "Real  estate " and "Real estate" are treated as the same name on both sides.
 */
export const normalizeIndustryName = (name: string): string =>
  name.trim().replace(/\s+/g, " ");

/**
 * Case-insensitive duplicate check against the already-known industries. The list can
 * be stale, so this only drives the inline warning - the server re-checks on save.
 */
export const findMatchingIndustry = (
  industries: CrmIndustryEntity[],
  name: string
): CrmIndustryEntity | undefined => {
  const normalized = normalizeIndustryName(name).toLowerCase();

  return industries.find(
    (industry) =>
      normalizeIndustryName(industry.name).toLowerCase() === normalized
  );
};
