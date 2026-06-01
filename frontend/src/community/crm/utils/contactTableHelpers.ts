import { CrmOwnerType } from "~community/crm/types/CommonTypes";

export const ownerFullName = (owner: CrmOwnerType): string =>
  [owner.firstName, owner.lastName].filter(Boolean).join(" ");
