import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface OwnerAvatarChipProps {
  id: string;
  owner: CrmOwner;
  backgroundColor?: string;
}

const OwnerAvatarChip: FC<OwnerAvatarChipProps> = ({
  id,
  owner,
  backgroundColor
}) => {
  const imageUrl = useGetImageUrl(owner.authPic ?? "");

  return (
    <AvatarChip
      avatarProps={{
        id,
        firstName: owner.firstName,
        lastName: owner.lastName ?? undefined,
        src: imageUrl ?? undefined,
        size: "sm"
      }}
      label={concatStrings([owner.firstName, owner.lastName ?? ""]).trim()}
      backgroundColor={backgroundColor}
    />
  );
};

export default OwnerAvatarChip;
