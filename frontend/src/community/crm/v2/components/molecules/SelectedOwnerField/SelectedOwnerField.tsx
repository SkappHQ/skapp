import { AvatarChip, CloseIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getOwnerName } from "~community/crm/v2/utils/crmEntityUtils";

interface SelectedOwnerFieldProps {
  label: string;
  owner: CrmOwnerEntity;
  onRemove: () => void;
  showRemoveButton: boolean;
  ariaLabel: string;
  required?: boolean;
}

const SelectedOwnerField: FC<SelectedOwnerFieldProps> = ({
  label,
  owner,
  onRemove,
  showRemoveButton,
  ariaLabel,
  required = false
}) => {
  const imageUrl = useGetImageUrl(owner.authPic ?? "");

  return (
    <div className="flex w-full flex-col gap-1">
      <span className="subtitle1 leading-normal inline-flex h-6 items-center">
        {label}
        {required && (
          <span className="text-semantic-red-accent ml-1" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <div className="flex h-[3.125rem] items-center rounded-lg bg-tertiary-background px-3">
        <AvatarChip
          label={getOwnerName(owner)}
          avatarProps={{
            id: owner.employeeId.toString(),
            firstName: owner.firstName,
            lastName: owner.lastName,
            src: imageUrl ?? undefined,
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
