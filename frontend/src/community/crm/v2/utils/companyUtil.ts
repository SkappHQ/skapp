import { useCrmStoreV2 } from "../store/store";
import { CrmCompanyEntity, CrmCompanyRecord } from "../types/CrmCommonTypes";

// Company helpers for the v2 normalized store. Companies are not embedded on the
// scalar deal/board payloads, so they are hydrated by id (POST /company/batch)
// and merged into the shared `companies` record.

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

// Merge companies into the store by id (keeps any metric fields a metrics fetch
// may have already filed against the same company).
export const upsertCompanies = (companies: CrmCompanyEntity[]): void => {
  const store = useCrmStoreV2.getState();
  const merged: CrmCompanyRecord = { ...store.companies };

  for (const company of companies) {
    if (company.id == null) continue;
    merged[company.id] = { ...merged[company.id], ...company };
  }

  store.setCompanies(merged);
};
