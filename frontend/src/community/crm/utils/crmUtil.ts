import { AvatarProps } from "@rootcodelabs/skapp-ui";
import { CrmOwner } from "../types/CommonTypes";

type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

export const toOwnerAvatarProps = (owner: CrmOwner): Omit<AvatarProps, "size"> => ({
  id: String(owner.employeeId),
  firstName: owner.firstName,
  lastName: owner.lastName ?? undefined,
  src: owner.authPic ?? undefined
});