import { CloseIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface Props {
  label: string;
  owner: CrmOwnerEntity;
  onRemove: () => void;
  showRemoveButton: boolean;
  ariaLabel: string;
  required?: boolean;
}

const SelectedOwnerField: FC<Props> = ({
  label,
  owner,
  onRemove,
  showRemoveButton,
  ariaLabel,
  required = false
}) => (
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
      <OwnerAvatarChip
        id={owner.employeeId.toString()}
        owner={owner}
        actionIcon={<CloseIcon />}
        onActionClick={onRemove}
        showActionButton={showRemoveButton}
        actionButtonAriaLabel={ariaLabel}
      />
    </div>
  </div>
);

export default SelectedOwnerField;
