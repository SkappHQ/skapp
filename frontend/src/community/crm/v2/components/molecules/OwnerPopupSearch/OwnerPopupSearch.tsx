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
import { useGetOwnerLookupV2 } from "~community/crm/v2/api/CrmLookupApi";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  buildOwnerOptions,
  findById
} from "~community/crm/v2/utils/dealFormUtil";

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
  const { data: ownerLookupData } = useGetOwnerLookupV2(
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

  const resolveUser = (id: number): CrmOwnerEntity | null =>
    findById(users, id, (u) => u.employeeId) ??
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
