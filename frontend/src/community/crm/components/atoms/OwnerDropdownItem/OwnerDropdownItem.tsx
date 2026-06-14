import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

const OwnerDropdownItem: FC<{ owner: CrmOwner }> = ({ owner }) => {
  const imageUrl = useGetImageUrl(owner.authPic ?? "");
  return (
    <AvatarChip
      avatarProps={{
        id: String(owner.employeeId),
        firstName: owner.firstName,
        lastName: owner.lastName ?? undefined,
        src: imageUrl ?? undefined,
        size: "sm"
      }}
      label={concatStrings([owner.firstName, owner.lastName ?? ""])}
    />
  );
};

export default OwnerDropdownItem;