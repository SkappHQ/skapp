import { CrmOwnerType } from "~community/crm/types/CommonTypes";

export {
  formatPhoneNumber,
  formatTasks,
  formatValue
} from "~community/crm/utils/companyTableHelpers";

export const ownerFullName = (owner: CrmOwnerType): string =>
  [owner.firstName, owner.lastName].filter(Boolean).join(" ");
