import { CrmContactType } from "./CommonTypes";

export type { CrmContactType };

export interface UpdateContactPayload {
  name?: string;
  email?: string;
  contactNumber?: string | null;
  companyId?: number | null;
  ownerId?: number | null;
}

export interface CrmContactsResponseType {
  items: CrmContactType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
