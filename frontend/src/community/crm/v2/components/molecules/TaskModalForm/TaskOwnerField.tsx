import { FormikProps } from "formik";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useGetOwnerLookupV2 } from "~community/crm/v2/api/ContactApi";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { updateOwnerRecord } from "~community/crm/v2/utils/commonUtil";

interface Props {
  formik: FormikProps<CrmTaskEntity>;
}

const TaskOwnerField: FC<Props> = ({ formik }) => {
  const { values, errors, setFieldValue } = formik;

  const translateText = useTranslator("crmModule", "tasks", "taskModal");

  const { isCrmSalesManager } = useSessionData();

  const { owners, setOwners } = useCrmStoreV2(
    useShallow((store) => ({
      owners: store.owners,
      setOwners: store.setOwners
    }))
  );

  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");

  const debouncedOwnerSearch = useDebounce(
    ownerSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { data: ownerLookupData } = useGetOwnerLookupV2(
    debouncedOwnerSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    Boolean(isCrmSalesManager) && debouncedOwnerSearch.length > 0
  );

  const ownerLookupItems = useMemo(
    () => ownerLookupData?.items ?? [],
    [ownerLookupData?.items]
  );

  const ownerDropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      ownerLookupItems.map((owner) => {
        const ownerId = String(owner.employeeId);
        return {
          id: ownerId,
          content: <OwnerAvatarChip id={ownerId} owner={owner} />
        };
      }),
    [ownerLookupItems]
  );

  const selectedOwner =
    values.ownerId != null ? owners[values.ownerId] : undefined;

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupItems.find(
      (lookupOwner) => String(lookupOwner.employeeId) === item.id
    );
    if (owner) setOwners(updateOwnerRecord(owners, [owner]));

    setFieldValue("ownerId", owner?.employeeId);
    setOwnerSearchTerm("");
  };

  const handleClearOwner = () => {
    setFieldValue("ownerId", null);
    setOwnerSearchTerm("");
  };

  return selectedOwner ? (
    <SelectedOwnerField
      label={translateText(["labels", "taskOwner"])}
      owner={selectedOwner}
      onRemove={handleClearOwner}
      showRemoveButton={Boolean(isCrmSalesManager)}
      ariaLabel={translateText(["ariaLabels", "removeOwner"])}
      required
    />
  ) : (
    <SearchableDropdown
      id="owner-search"
      items={ownerDropdownItems}
      onSelect={handleOwnerSelect}
      label={translateText(["labels", "taskOwner"])}
      placeholder={translateText(["placeholders", "taskOwner"])}
      value={ownerSearchTerm}
      onChange={(event) => setOwnerSearchTerm(event.target.value)}
      state={errors.ownerId ? "error" : "default"}
      errorMessage={errors.ownerId}
      emptyMessage={translateText(["emptyStates", "noOwners"])}
      required
    />
  );
};

export default TaskOwnerField;
