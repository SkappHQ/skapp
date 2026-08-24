import { CrmCompanyEntity, CrmCompanyRecord } from "../types/CrmCommonTypes";

export const toCompaniesRecord = (
  companies: CrmCompanyEntity[]
): CrmCompanyRecord => {
  const companyRecord: CrmCompanyRecord = {};
  for (const company of companies) {
    if (company.id != null) {
      companyRecord[company.id] = company;
    }
  }
  return companyRecord;
};

export const getMissingCompanyIds = (
  companyIds: number[],
  companies: CrmCompanyRecord
): number[] => {
  const unique = new Set<number>();
  for (const id of companyIds) {
    if (id != null && !companies[id]) unique.add(id);
  }
  return Array.from(unique).sort((a, b) => a - b);
};

export const mergeCompanies = (
  existing: CrmCompanyRecord,
  incoming: CrmCompanyEntity[]
): CrmCompanyRecord => {
  const merged: CrmCompanyRecord = { ...existing };
  for (const company of incoming) {
    if (company.id == null) continue;
    merged[company.id] = { ...merged[company.id], ...company };
  }
  return merged;
};
