import { AvatarChip, CloseIcon } from "@rootcodelabs/skapp-ui";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface Props {
  label: string;
  owner: CrmOwner;
  onRemove: () => void;
  showRemoveButton: boolean;
  ariaLabel: string;
}

const SelectedOwnerField: React.FC<Props> = ({
  label,
  owner,
  onRemove,
  showRemoveButton,
  ariaLabel
}) => {
  const imageUrl = useGetImageUrl(owner.authPic ?? "");

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="subtitle1 leading-normal inline-flex h-6 items-center">
        {label}
      </span>
      <div className="flex h-[3.125rem] items-center rounded-lg bg-tertiary-background">
        <AvatarChip
          label={concatStrings([owner.firstName, owner.lastName ?? ""])}
          avatarProps={{
            id: owner.employeeId.toString(),
            firstName: owner.firstName,
            lastName: owner.lastName ?? "",
            src: imageUrl ?? "",
            size: "sm"
          }}
          actionIcon={<CloseIcon />}
          onActionClick={onRemove}
          showActionButton={showRemoveButton}
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
};

export default SelectedOwnerField;
