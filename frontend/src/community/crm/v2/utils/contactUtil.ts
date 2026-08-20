import { useCrmStoreV2 } from "../store/store";
import { CrmContactEntity, CrmContactRecord } from "../types/CrmCommonTypes";

export const getContactDisplayName = (
  contact: CrmContactEntity | undefined
): string => {
  if (!contact) return "";
  if (contact.name) return contact.name;
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
};

export const upsertContacts = (contacts: CrmContactEntity[]): void => {
  const store = useCrmStoreV2.getState();
  const merged: CrmContactRecord = { ...store.contacts };

  for (const contact of contacts) {
    if (contact.id == null) continue;
    merged[contact.id] = { ...merged[contact.id], ...contact };
  }

  store.setContacts(merged);
};
