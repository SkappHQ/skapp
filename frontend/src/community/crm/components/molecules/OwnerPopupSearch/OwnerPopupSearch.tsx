import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

import OwnerOptionItem from "./OwnerOptionItem";
import OwnerTriggerContent from "./OwnerTriggerContent";

const toOption = (u: CrmOwner): DropdownOption => ({
  id: u.employeeId,
  value: u.employeeId,
  label: concatStrings([u.firstName, u.lastName ?? ""])
});

interface OwnerPopupSearchProps {
  users: CrmOwner[];
  selectedUser: CrmOwner | null;
  onSearch: (term: string) => void;
  onChange: (user: CrmOwner | null) => void;
  ariaInvalid?: boolean;
}

const OwnerPopupSearch: FC<OwnerPopupSearchProps> = ({
  users,
  selectedUser,
  onSearch,
  onChange,
  ariaInvalid
}) => {
  const translateText = useTranslator(
    "crmModule",
    "common",
    "ownerPopupSearch"
  );

  const handleChange = (val: DropdownValue | null) => {
    if (!val) return onChange(null);
    const { id } = val as DropdownOption;
    onChange(users.find((u) => u.employeeId === Number(id)) ?? null);
  };

  return (
    <DropdownWithSearchablePopup
      options={users.map(toOption)}
      value={selectedUser ? toOption(selectedUser) : null}
      onChange={handleChange}
      onSearch={onSearch}
      placeholder={translateText(["placeholder"])}
      searchPlaceholder={translateText(["searchPlaceholder"])}
      searchable
      clearable
      ariaInvalid={ariaInvalid}
      width="100%"
      renderTrigger={(_val, _isOpen, _disabled, triggerProps) => (
        <OwnerTriggerContent user={selectedUser} triggerProps={triggerProps} />
      )}
      renderOption={(option, _index, onSelect) => {
        const opt = option as DropdownOption;
        const user = users.find((u) => u.employeeId === Number(opt.id));
        if (!user) return null;
        return (
          <OwnerOptionItem
            key={opt.id}
            user={user}
            onSelect={() => onSelect(opt)}
          />
        );
      }}
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-tertiary-text">
          {translateText(["noResults"])}
        </div>
      )}
    />
  );
};

export default OwnerPopupSearch;
