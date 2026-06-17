import {
  AvatarChip,
  DropdownOption,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { concatStrings } from "~community/common/utils/commonUtil";
import EntityPopupSearch from "~community/crm/components/molecules/EntityPopupSearch/EntityPopupSearch";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface TriggerContentProps {
  user: CrmOwner | null;
  placeholder: string;
  triggerProps: TriggerProps;
  backgroundColor: string;
  chipBackgroundColor?: string;
}

const TriggerContent: FC<TriggerContentProps> = ({
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

interface OptionItemProps {
  user: CrmOwner;
  option: DropdownOption;
  onSelect: (opt: DropdownOption) => void;
}

const OptionItem: FC<OptionItemProps> = ({ user, option, onSelect }) => {
  const resolvedSrc = useGetImageUrl(user.authPic ?? "");

  return (
    <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-tertiary-background cursor-pointer w-full text-left"
      onClick={() => onSelect(option)}
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

interface Props {
  users: CrmOwner[];
  selectedUser: CrmOwner | null;
  onSearch: (term: string) => void;
  onChange: (user: CrmOwner | null) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
  backgroundColor?: string;
  chipBackgroundColor?: string;
}

const OwnerPopupSearch: FC<Props> = ({
  users,
  selectedUser,
  onSearch,
  onChange,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid,
  backgroundColor = "transparent",
  chipBackgroundColor
}) => (
  <EntityPopupSearch
    items={users}
    selectedItem={selectedUser}
    getItemId={(u: CrmOwner) => u.employeeId}
    getItemLabel={(u: CrmOwner) =>
      concatStrings([u.firstName, u.lastName ?? ""])
    }
    onChange={onChange}
    onSearch={onSearch}
    placeholder={placeholder}
    searchPlaceholder={searchPlaceholder}
    noResultsText={noResultsText}
    ariaInvalid={ariaInvalid}
    renderTrigger={(user: CrmOwner | null, triggerProps: TriggerProps) => (
      <TriggerContent
        user={user}
        placeholder={placeholder}
        triggerProps={triggerProps}
        backgroundColor={backgroundColor}
        chipBackgroundColor={chipBackgroundColor}
      />
    )}
    renderOption={(user: CrmOwner, option: DropdownOption, onSelect) => (
      <OptionItem
        key={option.id}
        user={user}
        option={option}
        onSelect={onSelect}
      />
    )}
  />
);

export default OwnerPopupSearch;
