import { CrmContactFormValues } from "~community/crm/types/CommonTypes";

type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

export const getChangedContactFields = (
  newValues: CrmContactFormValues,
  originalValues: CrmContactFormValues
): Partial<CrmContactFormValues> => {
  const changedFields: Partial<CrmContactFormValues> = {};

  if (newValues.name !== originalValues.name) {
    changedFields.name = newValues.name;
  }
  if (newValues.email !== originalValues.email) {
    changedFields.email = newValues.email;
  }
  if (newValues.contactNumber !== originalValues.contactNumber) {
    changedFields.contactNumber = newValues.contactNumber;
  }
  if (newValues.companyId !== originalValues.companyId) {
    changedFields.companyId = newValues.companyId;
  }
  if (newValues.ownerId !== originalValues.ownerId) {
    changedFields.ownerId = newValues.ownerId;
  }

  return changedFields;  
}

interface Id {
  id: number | string;
}

export const groupItemsByPriority = <T extends Id>(
  items: T[],
  priorityIds: number[]
): { prioritized: T[]; deprioritized: T[] } => {
  const prioritySet = new Set(priorityIds.map(String));

  const prioritized = items.filter((item) => prioritySet.has(String(item.id)));
  const deprioritized = items.filter(
    (item) => !prioritySet.has(String(item.id))
  );

  return { prioritized, deprioritized };
};
