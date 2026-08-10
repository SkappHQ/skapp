import { CrmContactEntity } from "~community/crm/v2/types/CrmTypes";

export interface CrmContactsSlice {
  contacts: Record<number, CrmContactEntity>;
  contactIds: number[];

  upsertContacts: (contacts: CrmContactEntity[]) => void;
  upsertContact: (contact: CrmContactEntity) => void;
  removeContact: (contactId: number) => void;

  setContactIds: (contactIds: number[]) => void;
  appendContactIds: (contactIds: number[]) => void;

  setContactDealIds: (contactId: number, dealIds: number[]) => void;
  appendContactDealIds: (contactId: number, dealIds: number[]) => void;

  setContactTaskIds: (contactId: number, taskIds: number[]) => void;
  appendContactTaskIds: (contactId: number, taskIds: number[]) => void;
}
