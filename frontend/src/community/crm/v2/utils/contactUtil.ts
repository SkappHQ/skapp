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

export const getSelectedContact = (
  contacts: CrmContactRecord,
  contactId: number | undefined
): CrmContactEntity | undefined => {
  if (contactId === undefined) return undefined;

  return contacts[contactId];
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
