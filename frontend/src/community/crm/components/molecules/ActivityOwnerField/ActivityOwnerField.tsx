import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetOwnerLookup } from "~community/crm/api/ContactApi";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import { updateOwnerRecord } from "~community/crm/utils/commonUtil";

interface Props {
  id: string;
  ownerId: number | null;
  errorMessage?: string;
  onChange: (ownerId: number | null) => void;
}

const ActivityOwnerField: FC<Props> = ({
  id,
  ownerId,
  errorMessage,
  onChange
}) => {
  const translateText = useTranslator("crmModule", "activities", "logActivity");
  const translateAria = useTranslator("crmAria", "activities", "logActivity");

  const { isSuperAdmin, isCrmAdmin, isCrmSalesManager } = useSessionData();

  const canChangeOwner = Boolean(
    isSuperAdmin || isCrmAdmin || isCrmSalesManager
  );

  const { owners, setOwners } = useCrmStore(
    useShallow((store) => ({
      owners: store.owners,
      setOwners: store.setOwners
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const { data: lookupData } = useGetOwnerLookup(
    debouncedSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    canChangeOwner && debouncedSearch.length > 0
  );

  const lookupItems = useMemo(
    () => (lookupData ? lookupData.items : []),
    [lookupData]
  );

  const dropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      lookupItems.map((owner) => {
        const employeeId = String(owner.employeeId);
        return {
          id: employeeId,
          content: <OwnerAvatarChip id={employeeId} owner={owner} />
        };
      }),
    [lookupItems]
  );

  const selectedOwner = ownerId != null ? owners[ownerId] : null;

  const handleSelect = (item: SearchableDropdownItem) => {
    const owner = lookupItems.find(
      (lookupOwner) => String(lookupOwner.employeeId) === item.id
    );
    if (owner) setOwners(updateOwnerRecord(owners, [owner]));

    onChange(owner ? owner.employeeId : null);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm("");
  };

  return selectedOwner ? (
    <SelectedOwnerField
      label={translateText(["labels", "activityOwner"])}
      owner={selectedOwner}
      onRemove={handleClear}
      showRemoveButton={canChangeOwner}
      ariaLabel={translateAria(["removeOwner"])}
    />
  ) : (
    <SearchableDropdown
      positionStrategy="fixed"
      id={id}
      items={dropdownItems}
      onSelect={handleSelect}
      label={translateText(["labels", "activityOwner"])}
      placeholder={translateText(["placeholders", "activityOwner"])}
      value={searchTerm}
      state={errorMessage ? "error" : "default"}
      errorMessage={errorMessage}
      onChange={(event) => setSearchTerm(event.target.value)}
      emptyMessage={translateText(["emptyStates", "noOwners"])}
    />
  );
};

export default ActivityOwnerField;
