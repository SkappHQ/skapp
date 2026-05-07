export interface CrmCompanyType {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  isDeleted: boolean;
}

export interface CrmCompaniesResponseType {
  items: CrmCompanyType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CreateCrmCompanyPayload {
  countryCode: string;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
}
