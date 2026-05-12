export interface CrmCompanyType {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  isDeleted: boolean;
}

export interface CrmCompanyResponseType {
  items: CrmCompanyType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmCompanyTableDataResponseType {
  items: CrmCompanyTableDataType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface CrmCompanyTableDataType {
  id: string;
  name: string;
  contactNumber: string;
  tasks: number;
  openValue: number;
  accountValue: number;
}

export interface CrmCompanyAddFormTypes {
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  countryCode: string | null;
  contactNumber: string | null;
}

export interface CrmCompanyCreatePayload {
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  contactNumber: string | null;
  createdBy: number | undefined;
  lastModifiedBy: number | undefined;
}
