import { TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, Ref } from "react";

import { CrmOwner } from "~community/crm/types/CommonTypes";

import OwnerAvatarChip from "./OwnerAvatarChip";

interface OwnerTriggerContentProps {
  user: CrmOwner | null;
  triggerProps: TriggerProps;
}

const OwnerTriggerContent: FC<OwnerTriggerContentProps> = ({
  user,
  triggerProps
}) => {
  const { ref, ...rest } = triggerProps;

  return (
    <button
      type="button"
      ref={ref as Ref<HTMLButtonElement>}
      {...rest}
      className="flex items-center w-full min-h-8 cursor-pointer rounded-lg"
    >
      {user && <OwnerAvatarChip user={user} backgroundColor="bg-gray-100" />}
    </button>
  );
};

export default OwnerTriggerContent;
