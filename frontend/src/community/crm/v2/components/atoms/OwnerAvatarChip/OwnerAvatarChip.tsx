import { AvatarChip, AvatarProps } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface OwnerAvatarChipProps {
  id: string;
  owner: CrmOwnerEntity;
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
        id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        src: imageUrl ?? undefined,
        size
      }}
      label={concatStrings([owner.firstName, owner.lastName ?? ""]).trim()}
      backgroundColor={backgroundColor}
    />
  );
};

export default OwnerAvatarChip;
