import { FormikProps } from "formik";
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
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import { updateOwnerRecord } from "~community/crm/utils/commonUtil";

interface Props {
  id: string;
  formik: FormikProps<CrmLogCallFormValues>;
}

const LogCallOwnerField: FC<Props> = ({ id, formik }) => {
  const { values, errors, setFieldValue } = formik;

  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logCall",
    "modal"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logCall",
    "modal"
  );

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
        const ownerId = String(owner.employeeId);
        return {
          id: ownerId,
          content: <OwnerAvatarChip id={ownerId} owner={owner} />
        };
      }),
    [lookupItems]
  );

  const selectedOwner = values.ownerId != null ? owners[values.ownerId] : null;

  const handleSelect = (item: SearchableDropdownItem) => {
    const owner = lookupItems.find(
      (lookupOwner) => String(lookupOwner.employeeId) === item.id
    );
    if (owner) setOwners(updateOwnerRecord(owners, [owner]));

    setFieldValue("ownerId", owner ? owner.employeeId : null);
    setSearchTerm("");
  };

  const handleClear = () => {
    setFieldValue("ownerId", null);
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
      id={id}
      items={dropdownItems}
      onSelect={handleSelect}
      label={translateText(["labels", "activityOwner"])}
      placeholder={translateText(["placeholders", "activityOwner"])}
      value={searchTerm}
      state={errors.ownerId ? "error" : "default"}
      errorMessage={errors.ownerId}
      onChange={(event) => setSearchTerm(event.target.value)}
      emptyMessage={translateText(["emptyStates", "noOwners"])}
    />
  );
};

export default LogCallOwnerField;
