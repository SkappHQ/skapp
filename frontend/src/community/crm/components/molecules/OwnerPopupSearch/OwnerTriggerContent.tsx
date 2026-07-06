import { AvatarChip, TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwner } from "~community/crm/types/CommonTypes";

export interface OwnerTriggerContentProps {
  user: CrmOwner;
  onSelect?: () => void;
  triggerProps?: Omit<TriggerProps, "onClick">;
}

const OwnerTriggerContent: FC<OwnerTriggerContentProps> = ({
  user,
  onSelect,
  triggerProps
}) => {
  const resolvedSrc = useGetImageUrl(user?.authPic ?? "");
  const { ref, ...triggerAriaProps } = triggerProps ?? {};

  return (
    <button
      ref={ref as RefObject<HTMLButtonElement> | undefined}
      className={`flex items-center w-full min-h-8 cursor-pointer rounded-lg`}
      onClick={onSelect}
      {...triggerAriaProps}
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
