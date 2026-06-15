import { AvatarChip } from "@rootcodelabs/skapp-ui";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface Props {
  label?: string;
  owner: CrmOwner;
  onRemove: () => void;
  showRemoveButton: boolean;
  ariaLabel: string;
  backgroundColor?: string;
  chipBackgroundColor?: string;
}

const SelectedOwnerField: React.FC<Props> = ({
  label,
  owner,
  onRemove,
  showRemoveButton,
  ariaLabel,
  backgroundColor = "bg-tertiary-background",
  chipBackgroundColor
}) => {
  const imageUrl = useGetImageUrl(owner.authPic ?? "");

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <span className="subtitle1 leading-normal inline-flex h-6 items-center">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={showRemoveButton ? onRemove : undefined}
        className={`flex h-[3.125rem] items-center rounded-lg px-3 w-full border-none outline-none text-left ${
          showRemoveButton ? "cursor-pointer" : "cursor-default"
        } ${backgroundColor}`}
        aria-label={ariaLabel}
      >
        <AvatarChip
          label={concatStrings([owner.firstName, owner.lastName ?? ""])}
          avatarProps={{
            id: owner.employeeId.toString(),
            firstName: owner.firstName,
            lastName: owner.lastName ?? "",
            src: imageUrl ?? "",
            size: "sm"
          }}
          backgroundColor={chipBackgroundColor}
          showActionButton={false}
          aria-label={ariaLabel}
        />
      </button>
    </div>
  );
};

export default SelectedOwnerField;
