import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
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
import { findById } from "~community/crm/utils/crmUtil";
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
  const users = useMemo(
    () => ownerLookupData?.items ?? [],
    [ownerLookupData?.items]
  );
  const options: DropdownOption[] = useMemo(
    () =>
      buildOwnerOptions(users, selectedUser, (u) =>
        concatStrings([u.firstName, u.lastName ?? ""])
      ),
    [users, selectedUser]
  );

  const selectedValue: DropdownOption | null = selectedUser
    ? {
        id: selectedUser.employeeId,
        value: selectedUser.employeeId,
        label: concatStrings([
          selectedUser.firstName,
          selectedUser.lastName ?? ""
        ])
      }
    : null;

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const { id } = val as DropdownOption;
    const user =
      findById(users, Number(id), (u) => u.employeeId) ??
      (selectedUser?.employeeId === Number(id) ? selectedUser : null);
    onChange(user);
  };

  const handleRenderTrigger = (
    option: DropdownOption,
    triggerProps: TriggerProps
  ) => {
    const user =
      findById(users, Number(option?.id), (u) => u.employeeId) ??
      (selectedUser?.employeeId === Number(option?.id) ? selectedUser : null);

    return user ? (
      <OwnerTriggerContent
        key={option.id}
        user={user}
        onSelect={() => {
          if (isCrmSalesManager) {
            triggerProps.onClick();
          }
        }}
      />
    ) : null;
  };

  const handleRenderOption = (
    option: DropdownOption,
    onSelect: (value: DropdownValue) => void
  ) => {
    const user =
      findById(users, Number(option.id), (u) => u.employeeId) ??
      (selectedUser?.employeeId === Number(option.id) ? selectedUser : null);

    return user ? (
      <OwnerOptionItem
        key={option.id}
        user={user}
        option={option}
        onSelect={onSelect}
      />
    ) : null;
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
      renderTrigger={(option, _a, _b, triggerProps) =>
        handleRenderTrigger(option as DropdownOption, triggerProps)
      }
      renderOption={(option, _index, onSelect) =>
        handleRenderOption(option as DropdownOption, onSelect)
      }
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-tertiary-text">
          {noResultsText}
        </div>
      )}
    />
  );
};

export default OwnerPopupSearch;
