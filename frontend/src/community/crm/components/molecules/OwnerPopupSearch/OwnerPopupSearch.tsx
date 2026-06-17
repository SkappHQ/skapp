import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

import { concatStrings } from "~community/common/utils/commonUtil";
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
}) => {
  const getLabel = (u: CrmOwner) =>
    concatStrings([u.firstName, u.lastName ?? ""]);

  const userMap = useMemo(
    () => new Map(users.map((u) => [u.employeeId, u])),
    [users]
  );

  const options: DropdownOption[] = useMemo(() => {
    const mapped = users.map((u) => ({
      id: u.employeeId,
      value: u.employeeId,
      label: getLabel(u)
    }));
    if (selectedUser && !userMap.has(selectedUser.employeeId)) {
      return [
        {
          id: selectedUser.employeeId,
          value: selectedUser.employeeId,
          label: getLabel(selectedUser)
        },
        ...mapped
      ];
    }
    return mapped;
  }, [users, selectedUser, userMap]);

  const selectedValue: DropdownOption | null = selectedUser
    ? {
        id: selectedUser.employeeId,
        value: selectedUser.employeeId,
        label: getLabel(selectedUser)
      }
    : null;

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const { id } = val as DropdownOption;
    const user =
      userMap.get(Number(id)) ??
      (selectedUser?.employeeId === id ? selectedUser : null);
    onChange(user);
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedValue}
      onChange={handleChange}
      onSearch={onSearch}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      searchable
      clearable
      ariaInvalid={ariaInvalid}
      width="100%"
      renderTrigger={(
        _val: DropdownValue | null,
        _isOpen: boolean,
        _disabled: boolean,
        triggerProps: TriggerProps
      ) => (
        <OwnerTriggerContent
          user={selectedUser}
          placeholder={placeholder}
          triggerProps={triggerProps}
          backgroundColor={backgroundColor}
          chipBackgroundColor={chipBackgroundColor}
        />
      )}
      renderOption={(option, _index, onSelect) => {
        const opt = option as DropdownOption;
        const id = Number(opt.id);
        const user =
          userMap.get(id) ??
          (selectedUser?.employeeId === id ? selectedUser : null);
        if (!user) return null;
        return (
          <OwnerOptionItem
            key={opt.id}
            user={user}
            option={opt}
            onSelect={onSelect}
          />
        );
      }}
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-tertiary-text">
          {noResultsText}
        </div>
      )}
    />
  );
};

export default OwnerPopupSearch;
