import { AvatarChip, DropdownOption } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwner } from "~community/crm/types/CommonTypes";

export interface OwnerOptionItemProps {
  user: CrmOwner;
  option: DropdownOption;
  onSelect: (opt: DropdownOption) => void;
}

const OwnerOptionItem: FC<OwnerOptionItemProps> = ({
  user,
  option,
  onSelect
}) => {
  const resolvedSrc = useGetImageUrl(user.authPic ?? "");

  return (
    <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 body2 hover:bg-tertiary-background cursor-pointer w-full text-left"
      onClick={() => onSelect(option)}
    >
      <AvatarChip
        label={user.firstName}
        avatarProps={{
          id: String(user.employeeId),
          firstName: user.firstName,
          lastName: user.lastName ?? "",
          src: resolvedSrc ?? "",
          size: "sm"
        }}
        showActionButton={false}
      />
    </button>
  );
};

export default OwnerOptionItem;
