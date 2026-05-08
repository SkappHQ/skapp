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

export interface CreateContactPayload {
  name: string;
  email: string;
  companyId?: number | null;
  contactNumber?: string | null;
  ownerId?: number | null;
}

export interface CrmOwnerApiItem {
  employeeId: number;
  firstName: string;
  lastName: string | null;
  email: string;
  crmRole: string;
}

export interface CrmOwnersResponseType {
  items: CrmOwnerApiItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
