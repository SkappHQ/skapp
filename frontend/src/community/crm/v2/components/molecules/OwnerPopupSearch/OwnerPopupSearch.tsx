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
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useGetOwnerLookup } from "~community/crm/v2/api/ContactApi";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmOwnerLookupFilterRequest } from "~community/crm/v2/types/CrmTypes";

import OwnerOptionItem from "./OwnerOptionItem";
import OwnerTriggerContent from "./OwnerTriggerContent";

interface Props {
  selectedUser: CrmOwnerEntity | null;
  onChange: (user: CrmOwnerEntity | null) => void;
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

  const ownerFilters: CrmOwnerLookupFilterRequest = {
    searchKeyword: debouncedOwnerSearch,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  const { data: ownerLookupData } = useGetOwnerLookup(
    ownerFilters,
    isCrmSalesManager ?? false
  );
  const users = useMemo(
    () => ownerLookupData?.items ?? [],
    [ownerLookupData?.items]
  );
  const dropdownOptions: DropdownOption[] = useMemo(() => {
    const toOption = (user: CrmOwnerEntity): DropdownOption => ({
      id: user.employeeId,
      value: user.employeeId,
      label: concatStrings([user.firstName, user.lastName ?? ""])
    });

    const base = users.map(toOption);
    const isSelectedMissing =
      selectedUser &&
      !users.some((user) => user.employeeId === selectedUser.employeeId);

    return isSelectedMissing ? [toOption(selectedUser), ...base] : base;
  }, [users, selectedUser]);

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

  const resolveUser = (id: number): CrmOwnerEntity | null =>
    users.find((user) => user.employeeId === id) ??
    (selectedUser?.employeeId === id ? selectedUser : null);

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const { id } = val as DropdownOption;
    onChange(resolveUser(Number(id)));
  };

  const handleRenderTrigger = (
    option: DropdownOption,
    triggerProps: TriggerProps
  ) => {
    const user = resolveUser(Number(option?.id));
    return user ? (
      <OwnerTriggerContent
        key={option.id}
        user={user}
        triggerProps={triggerProps}
        disabled={!isCrmSalesManager}
      />
    ) : null;
  };

  const handleRenderOption = (
    option: DropdownOption,
    onSelect: (value: DropdownValue) => void
  ) => {
    const user = resolveUser(Number(option.id));
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
      options={dropdownOptions}
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
        <div className="px-4 py-2 body2 text-tertiary-text">
          {noResultsText}
        </div>
      )}
    />
  );
};

export default OwnerPopupSearch;
