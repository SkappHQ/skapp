import { AvatarChip, TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwner } from "~community/crm/types/CommonTypes";

export interface OwnerTriggerContentProps {
  user: CrmOwner;
  triggerProps?: TriggerProps;
  disabled?: boolean;
}

const OwnerTriggerContent: FC<OwnerTriggerContentProps> = ({
  user,
  triggerProps,
  disabled = false
}) => {
  const resolvedSrc = useGetImageUrl(user?.authPic ?? "");

  return (
    <button
      className={`flex items-center w-full min-h-8 cursor-pointer rounded-lg`}
      {...triggerProps}
      ref={triggerProps?.ref as RefObject<HTMLButtonElement> | undefined}
      onClick={disabled ? undefined : triggerProps?.onClick}
    >
      <AvatarChip
        label={user.firstName}
        avatarProps={{
          id: String(user.employeeId),
          firstName: user.firstName,
          lastName: user.lastName ?? "",
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
