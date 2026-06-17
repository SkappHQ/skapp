import { DropdownOption, TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { concatStrings } from "~community/common/utils/commonUtil";
import EntityPopupSearch from "~community/crm/components/molecules/EntityPopupSearch/EntityPopupSearch";
import { CrmOwner } from "~community/crm/types/CommonTypes";

import OwnerOptionItem from "./OwnerOptionItem";
import OwnerTriggerContent from "./OwnerTriggerContent";

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
      <OwnerTriggerContent
        user={user}
        placeholder={placeholder}
        triggerProps={triggerProps}
        backgroundColor={backgroundColor}
        chipBackgroundColor={chipBackgroundColor}
      />
    )}
    renderOption={(user: CrmOwner, option: DropdownOption, onSelect) => (
      <OwnerOptionItem
        key={option.id}
        user={user}
        option={option}
        onSelect={onSelect}
      />
    )}
  />
);

export default OwnerPopupSearch;
