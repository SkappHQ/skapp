import { AvatarChip } from "@rootcodelabs/skapp-ui";
import type {
  DropdownOption,
  TriggerProps
} from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
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
      ref={ref as unknown as RefObject<HTMLDivElement>}
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
      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer w-full text-left"
      onClick={() => onSelect(option)}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc ?? ""}
          alt=""
          className="size-6 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="size-6 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-500">
          {user.firstName?.[0]?.toUpperCase()}
        </div>
      )}
      <span>{concatStrings([user.firstName, user.lastName ?? ""])}</span>
    </button>
  );
};

const getUserId = (u: CrmOwner) => u.employeeId;
const getUserLabel = (u: CrmOwner) =>
  concatStrings([u.firstName, u.lastName ?? ""]);

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

const PeoplePopupSearch: FC<Props> = ({
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
    getItemId={getUserId}
    getItemLabel={getUserLabel}
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
      <OptionItem key={option.id} user={user} option={option} onSelect={onSelect} />
    )}
  />
);

export default PeoplePopupSearch;
