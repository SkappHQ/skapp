import {
  CrmContactEntity,
  CrmDealEntity,
  CrmTaskEntity
} from "~community/crm/types/CrmTypes";

export interface CrmContactsSlice {
  contacts: Record<number, CrmContactEntity>;
  contactIds: number[];

  setContacts: (contacts: CrmContactEntity[], currentPage?: number) => void;
  upsertContacts: (contacts: CrmContactEntity[]) => void;
  upsertContact: (contact: CrmContactEntity) => void;
  removeContact: (contactId: number) => void;

  setContactDeals: (
    contactId: number,
    deals: CrmDealEntity[],
    currentPage?: number
  ) => void;
  setContactTasks: (
    contactId: number,
    tasks: CrmTaskEntity[],
    currentPage?: number
  ) => void;
}
