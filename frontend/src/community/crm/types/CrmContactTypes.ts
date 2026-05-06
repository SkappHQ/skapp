import { CrmCompanyType } from "./CrmCompanyTypes";

export interface CrmOwnerType {
  employeeId: number;
  firstName: string;
  lastName: string | null;
  authPic: string | null;
}

export interface CrmContactType {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  lastContactAt: string | null;
  company: CrmCompanyType | null;
  owner: CrmOwnerType;
  isDeleted: boolean;
}

export interface CrmContactsResponseType {
  items: CrmContactType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
