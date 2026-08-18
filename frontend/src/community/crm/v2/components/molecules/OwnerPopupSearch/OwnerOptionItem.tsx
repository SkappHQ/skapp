import { AvatarChip, DropdownOption } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";

export interface OwnerOptionItemProps {
  user: CrmOwnerEntity;
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
      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-tertiary-background cursor-pointer w-full text-left"
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
