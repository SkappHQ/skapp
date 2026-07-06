import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
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
        label={user.firstName}
        avatarProps={{
          id: String(user.employeeId),
          firstName: user.firstName,
          src: resolvedSrc ?? "",
          size: "sm"
        }}
        backgroundColor="bg-secondary-background"
        showActionButton={false}
      />
    </button>
  );
};

export default OwnerTriggerContent;
