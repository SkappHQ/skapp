import { AvatarChip, AvatarSize } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent, ReactNode } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface OwnerAvatarChipProps {
  id: string;
  owner: CrmOwnerEntity;
  backgroundColor?: string;
  size?: AvatarSize;
  actionIcon?: ReactNode;
  onActionClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  showActionButton?: boolean;
  actionButtonAriaLabel?: string;
}

const OwnerAvatarChip: FC<OwnerAvatarChipProps> = ({
  id,
  owner,
  backgroundColor,
  size = "sm",
  actionIcon,
  onActionClick,
  showActionButton,
  actionButtonAriaLabel
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
      actionIcon={actionIcon}
      onActionClick={onActionClick}
      showActionButton={showActionButton}
      actionButtonAriaLabel={actionButtonAriaLabel}
    />
  );
};

export default OwnerAvatarChip;
