import { AvatarChip, AvatarSize } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getOwnerName } from "~community/crm/v2/utils/crmEntityUtils";

interface OwnerAvatarChipProps {
  id: string;
  owner: CrmOwnerEntity;
  backgroundColor?: string;
  size?: AvatarSize;
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
      label={getOwnerName(owner)}
      backgroundColor={backgroundColor}
    />
  );
};

export default OwnerAvatarChip;
