import { useCrmStoreV2 } from "../store/store";
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

export const upsertCompanies = (companies: CrmCompanyEntity[]): void => {
  const store = useCrmStoreV2.getState();
  const merged: CrmCompanyRecord = { ...store.companies };

  for (const company of companies) {
    if (company.id == null) continue;
    merged[company.id] = { ...merged[company.id], ...company };
  }

  store.setCompanies(merged);
};
