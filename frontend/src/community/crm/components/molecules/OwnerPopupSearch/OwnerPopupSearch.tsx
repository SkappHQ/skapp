import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup
} from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { concatStrings } from "~community/common/utils/commonUtil";
import { useGetOwnerLookup } from "~community/crm/api/ContactApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmOwner } from "~community/crm/types/CommonTypes";
import { buildOwnerOptions } from "~community/crm/utils/dealUtil";

import OwnerOptionItem from "./OwnerOptionItem";
import OwnerTriggerContent from "./OwnerTriggerContent";

interface Props {
  selectedUser: CrmOwner | null;
  onChange: (user: CrmOwner | null) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
}

const OwnerPopupSearch: FC<Props> = ({
  selectedUser,
  onChange,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid
}) => {
  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const { isCrmSalesManager } = useSessionData();
  const debouncedOwnerSearch = useDebounce(
    ownerSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: ownerLookupData } = useGetOwnerLookup(
    debouncedOwnerSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isCrmSalesManager ?? false
  );
  const users = ownerLookupData?.items ?? [];
  const getLabel = (u: CrmOwner) =>
    concatStrings([u.firstName, u.lastName ?? ""]);

  const options: DropdownOption[] = useMemo(
    () => buildOwnerOptions(users, selectedUser, getLabel),
    [users, selectedUser]
  );

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
      users.find((u) => u.employeeId === Number(id)) ??
      (selectedUser?.employeeId === id ? selectedUser : null);
    onChange(user);
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedValue}
      onChange={handleChange}
      onSearch={setOwnerSearchTerm}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      searchable
      clearable
      ariaInvalid={ariaInvalid}
      width="100%"
      renderTrigger={(option, _a, _b, triggerProps) => {
        const opt = option as DropdownOption;
        const user = users.find((u) => u.employeeId === Number(opt.id));
        return user ? (
          <OwnerTriggerContent
            key={opt.id}
            user={user}
            onSelect={() => {
              triggerProps.onClick();
            }}
          />
        ) : null;
      }}
      renderOption={(option, _index, onSelect) => {
        const opt = option as DropdownOption;
        const user = users.find((u) => u.employeeId === Number(opt.id));
        return user ? (
          <OwnerOptionItem
            key={opt.id}
            user={user}
            option={opt}
            onSelect={onSelect}
          />
        ) : null;
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
