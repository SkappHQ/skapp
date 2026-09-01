import { Avatar, AvatarSize } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface OwnerAvatarProps {
  id: string;
  owner: CrmOwnerEntity;
  size?: AvatarSize;
}

const OwnerAvatar: FC<OwnerAvatarProps> = ({ id, owner, size = "sm" }) => {
  const imageUrl = useGetImageUrl(owner.authPic ?? "");

  return (
    <Avatar
      id={id}
      size={size}
      src={imageUrl ?? undefined}
      firstName={owner.firstName}
      lastName={owner.lastName}
    />
  );
};

export default OwnerAvatar;
