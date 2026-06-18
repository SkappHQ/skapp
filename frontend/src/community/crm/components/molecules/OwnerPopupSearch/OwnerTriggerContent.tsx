import { AvatarChip, TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

export interface OwnerTriggerContentProps {
  user: CrmOwner | null;
  placeholder: string;
  triggerProps: TriggerProps;
  backgroundColor: string;
  chipBackgroundColor?: string;
}

const OwnerTriggerContent: FC<OwnerTriggerContentProps> = ({
  user,
  placeholder,
  triggerProps,
  backgroundColor,
  chipBackgroundColor
}) => {
  const { ref, ...rest } = triggerProps;
  const resolvedSrc = useGetImageUrl(user?.authPic ?? "");

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      {...rest}
      className={`flex items-center w-full min-h-8 cursor-pointer rounded-lg ${backgroundColor}`}
    >
      {user ? (
        <AvatarChip
          label={concatStrings([user.firstName, user.lastName ?? ""])}
          avatarProps={{
            id: String(user.employeeId),
            firstName: user.firstName,
            lastName: user.lastName ?? "",
            src: resolvedSrc ?? "",
            size: "sm"
          }}
          backgroundColor={chipBackgroundColor}
          showActionButton={false}
        />
      ) : (
        <span className="body2 text-tertiary-text">{placeholder}</span>
      )}
    </div>
  );
};

export default OwnerTriggerContent;
