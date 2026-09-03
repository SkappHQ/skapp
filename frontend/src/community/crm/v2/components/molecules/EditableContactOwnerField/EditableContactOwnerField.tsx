import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { concatStrings } from "~community/common/utils/commonUtil";
import { useGetOwnerLookup } from "~community/crm/v2/api/ContactApi";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/v2/constants/commonConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmOwnerLookupFilterRequest } from "~community/crm/v2/types/CrmTypes";
import { getOwnerById } from "~community/crm/v2/utils/commonUtil";

interface EditableContactOwnerFieldProps {
  ownerId?: number;
  errorMessage?: string;
  translateText: TranslatorFunctionType;
  onChange: (owner?: CrmOwnerEntity) => void;
}

const EditableContactOwnerField: FC<EditableContactOwnerFieldProps> = ({
  ownerId,
  errorMessage,
  translateText,
  onChange
}) => {
  const [ownerSearchText, setOwnerSearchText] = useState("");

  const debouncedOwnerSearch = useDebounce(
    ownerSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const owners = useCrmStoreV2((store) => store.owners);

  const ownerFilters: CrmOwnerLookupFilterRequest = {
    searchKeyword: debouncedOwnerSearch,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  const { data: ownerLookupData, isFetching } = useGetOwnerLookup(ownerFilters);

  const selectedOwner = getOwnerById(owners, ownerId);

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    onChange(
      ownerLookupData?.items.find(
        (owner) => String(owner.employeeId) === item.id
      )
    );
    setOwnerSearchText("");
  };

  if (selectedOwner) {
    return (
      <SelectedOwnerField
        label={translateText(["labels", "owner"])}
        owner={selectedOwner}
        onRemove={() => onChange(undefined)}
        showRemoveButton
        ariaLabel={translateText(["ariaLabels", "clearOwner"])}
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
      label={translateText(["labels", "owner"])}
      placeholder={translateText(["placeholders", "owner"])}
      value={ownerSearchText}
      onChange={(event) => setOwnerSearchText(event.target.value)}
      state={errorMessage ? "error" : "default"}
      errorMessage={errorMessage}
      isOpenOnFocus
      emptyMessage={
        isFetching ? undefined : translateText(["emptyStates", "noOwners"])
      }
    />
  );
};

export default EditableContactOwnerField;
