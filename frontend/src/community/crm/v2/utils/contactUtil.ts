import { CrmContactEntity, CrmContactRecord } from "../types/CrmCommonTypes";

export const toContactsRecord = (
  contacts: CrmContactEntity[]
): CrmContactRecord => {
  const contactRecord: CrmContactRecord = {};
  for (const contact of contacts) {
    if (contact.id != null) {
      contactRecord[contact.id] = contact;
    }
  }
  return contactRecord;
};

export const getContactDisplayName = (
  contact: CrmContactEntity | undefined
): string => {
  if (!contact) return "";
  if (contact.name) return contact.name;
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
};
