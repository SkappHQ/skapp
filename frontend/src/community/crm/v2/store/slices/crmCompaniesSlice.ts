import {
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmTaskEntity
} from "~community/crm/types/CrmTypes";

export interface CrmCompaniesSlice {
  companies: Record<number, CrmCompanyEntity>;
  companyIds: number[];

  setCompanies: (companies: CrmCompanyEntity[], currentPage?: number) => void;
  upsertCompanies: (companies: CrmCompanyEntity[]) => void;
  upsertCompany: (company: CrmCompanyEntity) => void;
  removeCompany: (companyId: number) => void;

  setCompanyContacts: (companyId: number, contacts: CrmContactEntity[]) => void;
  setCompanyDeals: (companyId: number, deals: CrmDealEntity[]) => void;
  setCompanyTasks: (companyId: number, tasks: CrmTaskEntity[]) => void;
}
