import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface OwnerAvatarChipProps {
  user: CrmOwner;
  backgroundColor?: string;
}

const OwnerAvatarChip: FC<OwnerAvatarChipProps> = ({ user, backgroundColor }) => {
  const resolvedSrc = useGetImageUrl(user.authPic ?? "");
  const avatarSrc = user.authPic ? resolvedSrc : "";

  return (
    <AvatarChip
      label={concatStrings([user.firstName, user.lastName ?? ""])}
      avatarProps={{
        id: String(user.employeeId),
        firstName: user.firstName,
        lastName: user.lastName ?? "",
        src: avatarSrc || "",
        size: "sm"
      }}
      backgroundColor={backgroundColor}
      showActionButton={false}
    />
  );
};

export default OwnerAvatarChip;
