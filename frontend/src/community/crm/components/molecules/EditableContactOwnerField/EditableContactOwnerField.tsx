import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { useEffect, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { concatStrings } from "~community/common/utils/commonUtil";
import { useGetOwnerLookup } from "~community/crm/api/ContactApi";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface EditableContactOwnerFieldProps {
  initialOwner: CrmOwner | null;
  errorMessage?: string;
  translateContactText: TranslatorFunctionType;
  onChange: (owner: CrmOwner | null) => void;
}

const EditableContactOwnerField = ({
  initialOwner,
  errorMessage,
  translateContactText,
  onChange
}: EditableContactOwnerFieldProps) => {
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(
    initialOwner
  );
  const [ownerSearchText, setOwnerSearchText] = useState("");
  const debouncedOwnerSearch = useDebounce(
    ownerSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  useEffect(() => {
    setSelectedOwner(initialOwner);
  }, [initialOwner]);

  const { data: ownerLookupData, isFetching: isOwnerFetching } =
    useGetOwnerLookup(debouncedOwnerSearch, DEFAULT_LOOKUP_PAGE_SIZE, true);

  const ownerDropdownItems: SearchableDropdownItem[] =
    ownerLookupData?.items?.map((owner) => ({
      id: String(owner.employeeId),
      content: (
        <AvatarChip
          avatarProps={{
            id: String(owner.employeeId),
            firstName: owner.firstName,
            lastName: owner.lastName ?? undefined,
            src: owner.authPic ?? undefined,
            size: "sm"
          }}
          label={concatStrings([owner.firstName, owner.lastName ?? ""])}
        />
      )
    })) ?? [];

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (lookupOwner) => String(lookupOwner.employeeId) === item.id
    );
    setSelectedOwner(owner);
    setOwnerSearchText("");
    onChange(owner);
  };

  const handleClearOwner = () => {
    setSelectedOwner(null);
    onChange(null);
  };

  if (selectedOwner) {
    return (
      <SelectedOwnerField
        label={translateContactText(["labels", "owner"])}
        owner={selectedOwner}
        onRemove={handleClearOwner}
        showRemoveButton
        ariaLabel={translateContactText(["ariaLabels", "clearOwner"])}
      />
    );
  }

  return (
    <SearchableDropdown
      id="contact-owner-search"
      items={ownerDropdownItems}
      onSelect={handleOwnerSelect}
      label={translateContactText(["labels", "owner"])}
      placeholder={translateContactText(["placeholders", "owner"])}
      value={ownerSearchText}
      onChange={(event) => setOwnerSearchText(event.target.value)}
      state={errorMessage ? "error" : "default"}
      errorMessage={errorMessage}
      isOpenOnFocus
      emptyMessage={
        isOwnerFetching
          ? undefined
          : translateContactText(["emptyStates", "noOwners"])
      }
    />
  );
};

export default EditableContactOwnerField;
