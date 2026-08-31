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

export const updateContactRecord = (
  existingContacts: CrmContactRecord,
  newContacts: CrmContactEntity[]
): CrmContactRecord => {
  const updatedRecord: CrmContactRecord = { ...existingContacts };
  for (const contact of newContacts) {
    if (contact.id == null) continue;
    updatedRecord[contact.id] = { ...updatedRecord[contact.id], ...contact };
  }
  return updatedRecord;
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
