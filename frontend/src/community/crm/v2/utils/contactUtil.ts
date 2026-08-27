import { DropdownOption } from "@rootcodelabs/skapp-ui";

import {
  CrmCompanyRecord,
  CrmContactEntity,
  CrmContactRecord
} from "../types/CrmCommonTypes";

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

export const mergeContacts = (
  existing: CrmContactRecord,
  incoming: CrmContactEntity[]
): CrmContactRecord => {
  const merged: CrmContactRecord = { ...existing };
  for (const contact of incoming) {
    if (contact.id == null) continue;
    merged[contact.id] = { ...merged[contact.id], ...contact };
  }
  return merged;
};

export const getContactDisplayName = (
  contact: CrmContactEntity | undefined
): string => {
  if (!contact) return "";
  if (contact.name) return contact.name;
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
};

export const buildContactOptions = (
  contacts: CrmContactEntity[],
  companies: CrmCompanyRecord
): DropdownOption[] =>
  contacts.reduce<DropdownOption[]>((options, contact) => {
    if (contact.id == null) return options;
    const contactName = getContactDisplayName(contact);
    const companyName =
      contact.companyId != null
        ? companies[contact.companyId]?.name
        : undefined;
    options.push({
      id: contact.id,
      value: contact.id,
      label: companyName ? `${contactName} ${companyName}` : contactName
    });
    return options;
  }, []);
