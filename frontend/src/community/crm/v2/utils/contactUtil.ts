import { DropdownOption } from "@rootcodelabs/skapp-ui";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { ADD_NEW_COMPANY_OPTION_ID } from "~community/crm/v2/constants/contactConstants";
import { CrmMetricLabelThemeEnum } from "~community/crm/v2/enums/common";
import {
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmContactEntity,
  CrmContactRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import { appendId } from "~community/crm/v2/utils/commonUtil";
import {
  CrmMetricItem,
  getCompanyById
} from "~community/crm/v2/utils/companyUtil";

export const toContactsRecord = (
  contacts: CrmContactEntity[]
): CrmContactRecord => {
  const contactRecord: CrmContactRecord = {};
  for (const contact of contacts) {
    if (contact.id !== undefined) {
      contactRecord[contact.id] = contact;
    }
  }
  return contactRecord;
};

export const toContactIds = (contacts: CrmContactEntity[]): number[] => {
  const contactIds: number[] = [];
  for (const contact of contacts) {
    if (contact.id !== undefined) {
      contactIds.push(contact.id);
    }
  }
  return contactIds;
};

export const updateContactRecord = (
  existing: CrmContactRecord,
  incoming: CrmContactEntity[]
): CrmContactRecord => {
  const merged: CrmContactRecord = { ...existing };
  for (const contact of incoming) {
    if (contact.id !== undefined) {
      merged[contact.id] = { ...merged[contact.id], ...contact };
    }
  }
  return merged;
};

export const getContactCompanyIds = (
  contacts: CrmContactRecord,
  contactIds: number[]
): number[] => {
  const companyIds: number[] = [];
  for (const contactId of contactIds) {
    const companyId = contacts[contactId]?.companyId;
    if (companyId != null) {
      companyIds.push(companyId);
    }
  }
  return companyIds;
};

export const linkContactToCompany = (
  contact: CrmContactEntity,
  companies: CrmCompanyRecord,
  previousCompanyId?: number | null
): CrmCompanyRecord => {
  const contactId = contact.id;

  if (contactId === undefined) {
    return companies;
  }

  let linked = companies;

  if (previousCompanyId != null && previousCompanyId !== contact.companyId) {
    const previousCompany = linked[previousCompanyId];

    if (previousCompany?.contactIds !== undefined) {
      linked = {
        ...linked,
        [previousCompanyId]: {
          ...previousCompany,
          contactIds: previousCompany.contactIds.filter(
            (id) => id !== contactId
          )
        }
      };
    }
  }

  if (contact.companyId != null) {
    const company = linked[contact.companyId];

    if (company?.contactIds !== undefined) {
      linked = {
        ...linked,
        [contact.companyId]: {
          ...company,
          contactIds: appendId(company.contactIds, contactId)
        }
      };
    }
  }

  return linked;
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
): DropdownOption[] => {
  const options: DropdownOption[] = [];

  for (const contact of contacts) {
    if (contact.id !== undefined) {
      const contactName = getContactDisplayName(contact);
      const companyName = getCompanyById(companies, contact.companyId)?.name;

      options.push({
        id: contact.id,
        value: contact.id,
        label: companyName ? `${contactName} ${companyName}` : contactName
      });
    }
  }

  return options;
};

export const getContactMetricItems = (
  contact: CrmContactEntity,
  translateText: TranslatorFunctionType
): CrmMetricItem[] => {
  const metrics = contact.metrics;

  const openTasks: CrmMetricItem = {
    id: "openTasksCount",
    title: translateText(["metrics", "openTasks"]),
    amount: metrics?.openTasksCount ?? 0
  };

  if (
    metrics?.overdueTasksCount !== undefined &&
    metrics.overdueTasksCount > 0
  ) {
    openTasks.chip = {
      label: translateText(["metrics", "overdueChipLabel"], {
        count: String(metrics.overdueTasksCount)
      }),
      variant: CrmMetricLabelThemeEnum.RED
    };
  }

  return [
    openTasks,
    {
      id: "activeDealsCount",
      title: translateText(["metrics", "activeDeals"]),
      amount: metrics?.activeDealsCount ?? 0
    },
    {
      id: "closedDealValue",
      title: translateText(["metrics", "totalRevenue"]),
      amount: metrics?.closedDealValue,
      isCurrency: true
    },
    {
      id: "pipelineRevenue",
      title: translateText(["metrics", "pipelineRevenue"]),
      amount: metrics?.pipelineRevenue,
      isCurrency: true
    }
  ];
};

export const updateContact = (
  contacts: CrmContactRecord,
  contactId: number,
  updatedFields: CrmContactEntity
): CrmContactRecord => ({
  ...contacts,
  [contactId]: { ...contacts[contactId], ...updatedFields }
});

export const removeContact = (
  contacts: CrmContactRecord,
  contactIds: number[],
  contactId: number
) => {
  const remainingContacts = { ...contacts };
  delete remainingContacts[contactId];

  return {
    contacts: remainingContacts,
    contactIds: contactIds.filter((id) => id !== contactId)
  };
};

export const getSelectedContact = (
  contacts: CrmContactRecord,
  contactId: number | null
) => {
  if (contactId !== null) {
    return contacts[contactId];
  }
};

export const getContactFieldDiff = (
  initialValues: CrmContactEntity,
  currentValues: CrmContactEntity
): CrmContactEntity => {
  const changedFields: CrmContactEntity = {};

  if (currentValues.name !== initialValues.name) {
    changedFields.name = currentValues.name;
  }

  if (currentValues.email !== initialValues.email) {
    changedFields.email = currentValues.email;
  }

  if (currentValues.contactNumber !== initialValues.contactNumber) {
    changedFields.contactNumber = currentValues.contactNumber;
  }

  if (currentValues.companyId !== initialValues.companyId) {
    changedFields.companyId = currentValues.companyId;
  }

  if (currentValues.ownerId !== initialValues.ownerId) {
    changedFields.ownerId = currentValues.ownerId;
  }

  return changedFields;
};

/** The part of an email after the @, used to suggest a matching company. */
export const getEmailDomain = (email: string): string => {
  const parts = email.trim().split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
};

export interface CrmCompanyOption {
  id: string;
  name?: string;
  isSuggested: boolean;
}

/**
 * Companies matching the email domain come first and are marked, the rest of
 * the lookup follows with duplicates removed.
 */
export const getCompanyOptions = (
  lookupCompanies?: CrmCompanyEntity[],
  suggestedCompanies?: CrmCompanyEntity[],
  newCompanyName?: string
): CrmCompanyOption[] => {
  const suggestedIds = new Set<number>();
  const options: CrmCompanyOption[] = [];

  for (const company of suggestedCompanies ?? []) {
    if (company.id !== undefined) {
      suggestedIds.add(company.id);
      options.push({
        id: String(company.id),
        name: company.name,
        isSuggested: true
      });
    }
  }

  for (const company of lookupCompanies ?? []) {
    if (company.id !== undefined && !suggestedIds.has(company.id)) {
      options.push({
        id: String(company.id),
        name: company.name,
        isSuggested: false
      });
    }
  }

  if (newCompanyName !== undefined) {
    const trimmedName = newCompanyName.trim();
    const isNameAvailable = !options.some(
      (option) => option.name?.toLowerCase() === trimmedName.toLowerCase()
    );

    if (
      trimmedName.length > 0 &&
      trimmedName.length <= characterLengths.COMPANY_NAME_LENGTH &&
      isNameAvailable
    ) {
      options.push({
        id: ADD_NEW_COMPANY_OPTION_ID,
        name: trimmedName,
        isSuggested: false
      });
    }
  }

  return options;
};
