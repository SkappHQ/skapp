import { CrmCompanyEntity } from "~community/crm/v2/types/CrmTypes";

export interface CrmCompaniesSlice {
  companies: Record<number, CrmCompanyEntity>;
  companyIds: number[];

  upsertCompanies: (companies: CrmCompanyEntity[]) => void;
  upsertCompany: (company: CrmCompanyEntity) => void;
  removeCompany: (companyId: number) => void;

  setCompanyIds: (companyIds: number[]) => void;
  appendCompanyIds: (companyIds: number[]) => void;

  setCompanyContactIds: (companyId: number, contactIds: number[]) => void;
  appendCompanyContactIds: (companyId: number, contactIds: number[]) => void;

  setCompanyDealIds: (companyId: number, dealIds: number[]) => void;
  appendCompanyDealIds: (companyId: number, dealIds: number[]) => void;

  setCompanyTaskIds: (companyId: number, taskIds: number[]) => void;
  appendCompanyTaskIds: (companyId: number, taskIds: number[]) => void;
}
