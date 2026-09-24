import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { concatStrings } from "~community/common/utils/commonUtil";
import { useGetOwnerLookupV2 } from "~community/crm/v2/api/ContactApi";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/v2/constants/commonConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getOwnerById,
  updateOwnerRecord
} from "~community/crm/v2/utils/commonUtil";

interface EditableContactOwnerFieldProps {
  ownerId?: number;
  errorMessage?: string;
  onChange: (owner?: CrmOwnerEntity) => void;
}

const EditableContactOwnerField: FC<EditableContactOwnerFieldProps> = ({
  ownerId,
  errorMessage,
  onChange
}) => {
  const translateText = useTranslator("crmModuleV2");
  const translateAria = useTranslator("crmAriaV2");
  const [ownerSearchText, setOwnerSearchText] = useState("");

  const debouncedOwnerSearch = useDebounce(
    ownerSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { owners, setOwners } = useCrmStoreV2(
    useShallow((state) => ({
      owners: state.owners,
      setOwners: state.setOwners
    }))
  );

  const { data: ownerLookupData, isFetching } = useGetOwnerLookupV2(
    debouncedOwnerSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    true
  );

  const selectedOwner = getOwnerById(owners, ownerId);

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items.find(
      (lookupOwner) => String(lookupOwner.employeeId) === item.id
    );

    if (owner) {
      setOwners(updateOwnerRecord(owners, [owner]));
    }

    onChange(owner);
    setOwnerSearchText("");
  };

  if (selectedOwner) {
    return (
      <SelectedOwnerField
        label={translateText(["contacts", "modal", "labels", "owner"])}
        owner={selectedOwner}
        onRemove={() => onChange(undefined)}
        showRemoveButton
        ariaLabel={translateAria(["contacts", "modal", "clearOwner"])}
      />
    );
  }

  const ownerDropdownItems: SearchableDropdownItem[] = [];

  if (ownerLookupData) {
    for (const owner of ownerLookupData.items) {
      ownerDropdownItems.push({
        id: String(owner.employeeId),
        content: (
          <AvatarChip
            avatarProps={{
              id: String(owner.employeeId),
              firstName: owner.firstName,
              lastName: owner.lastName,
              src: owner.authPic ?? undefined,
              size: "sm"
            }}
            label={concatStrings([
              owner.firstName,
              owner.lastName ?? ""
            ]).trim()}
          />
        )
      });
    }
  }

  return (
    <SearchableDropdown
      id="contact-owner-search"
      items={ownerDropdownItems}
      onSelect={handleOwnerSelect}
      label={translateText(["contacts", "modal", "labels", "owner"])}
      placeholder={translateText([
        "contacts",
        "modal",
        "placeholders",
        "owner"
      ])}
      value={ownerSearchText}
      onChange={(event) => setOwnerSearchText(event.target.value)}
      state={errorMessage ? "error" : "default"}
      errorMessage={errorMessage}
      isOpenOnFocus
      emptyMessage={
        isFetching
          ? undefined
          : translateText(["contacts", "modal", "emptyStates", "noOwners"])
      }
    />
  );
};

export default EditableContactOwnerField;
