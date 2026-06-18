import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

export interface OwnerTriggerContentProps {
  user: CrmOwner;
  onSelect?: () => void;
}

const OwnerTriggerContent: FC<OwnerTriggerContentProps> = ({
  user,
  onSelect
}) => {
  const resolvedSrc = useGetImageUrl(user?.authPic ?? "");

  return (
    <button
      className={`flex items-center w-full min-h-8 cursor-pointer rounded-lg`}
      onClick={onSelect}
    >
      <AvatarChip
        label={concatStrings([user.firstName, user.lastName ?? ""])}
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

export default OwnerTriggerContent;
