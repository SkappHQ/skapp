import { CrmOwner } from "~community/crm/types/CommonTypes";

type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

export const toOwnerAvatarProps = (owner: CrmOwner) => ({
  id: String(owner.employeeId),
  firstName: owner.firstName,
  lastName: owner.lastName ?? "",
  src: owner.authPic ?? ""
});
