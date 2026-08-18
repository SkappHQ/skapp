import { useCrmStoreV2 } from "../store/store";
import { CrmContactEntity, CrmContactRecord } from "../types/CrmCommonTypes";

// The v2 contact wire carries a single `name`; older/entity shapes may only have
// firstName/lastName. Resolve a display name from whichever is present.
export const getContactDisplayName = (
  contact: CrmContactEntity | undefined
): string => {
  if (!contact) return "";
  if (contact.name) return contact.name;
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
};

// Merge contacts into the store by id (keeps any metric fields a metrics fetch
// may have already filed against the same contact). Mirrors upsertCompanies:
// contacts are hydrated by id (POST /contact/batch) for scalar deal/board cards
// referencing a contact not loaded at init.
export const upsertContacts = (contacts: CrmContactEntity[]): void => {
  const store = useCrmStoreV2.getState();
  const merged: CrmContactRecord = { ...store.contacts };

  for (const contact of contacts) {
    if (contact.id == null) continue;
    merged[contact.id] = { ...merged[contact.id], ...contact };
  }

  store.setContacts(merged);
};
