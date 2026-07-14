import { AvatarChip, AvatarProps } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface OwnerAvatarChipProps {
  id?: string;
  owner: CrmOwner;
  backgroundColor?: string;
  size?: AvatarProps["size"];
}

const OwnerAvatarChip: FC<OwnerAvatarChipProps> = ({
  id,
  owner,
  backgroundColor,
  size = "sm"
}) => {
  const imageUrl = useGetImageUrl(owner.authPic ?? "");

  return (
    <AvatarChip
      avatarProps={{
        id: id ?? String(owner.employeeId),
        firstName: owner.firstName,
        lastName: owner.lastName ?? undefined,
        src: imageUrl ?? undefined,
        size
      }}
      label={concatStrings([owner.firstName, owner.lastName ?? ""]).trim()}
      backgroundColor={backgroundColor}
    />
  );
};

export default OwnerAvatarChip;
