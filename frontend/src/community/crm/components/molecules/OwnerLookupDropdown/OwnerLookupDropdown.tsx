import { AvatarChip, CloseIcon } from "@rootcodelabs/skapp-ui";
import React, { useEffect, useMemo, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { concatStrings } from "~community/common/utils/commonUtil";
import { useGetOwnerLookup } from "~community/crm/api/ContactApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmOwner } from "~community/crm/types/CommonTypes";
import { toOwnerAvatarProps } from "~community/crm/utils/crmUtil";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface OwnerLookupDropdownProps {
  onOwnerChange: (ownerId: number | null) => void;
  translateText: (keys: string[]) => string;
}

const OwnerLookupDropdown: React.FC<OwnerLookupDropdownProps> = ({
  onOwnerChange,
  translateText
}) => {
  const { isCrmSalesManager } = useSessionData();
  const { data: currentUser } = useGetUserPersonalDetails();

  // If the user has Sales Manager Role, they should not be able to edit the owner field.
  const isOwnerReadonly = !isCrmSalesManager;

  const [ownerSearch, setOwnerSearch] = useState("");

  // undefined = not yet initialized; null = explicitly cleared; CrmOwner = selected
  const [selectedOwner, setSelectedOwner] = useState<
    CrmOwner | null | undefined
  >(undefined);

  // Remembers the last confirmed selection so an accidental clear can be undone on dropdown close
  const [lastSelectedOwner, setLastSelectedOwner] = useState<CrmOwner | null>(
    null
  );

  const debouncedOwnerSearch = useDebounce(
    ownerSearch.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const currentUserAsOwner = useMemo<CrmOwner>(
    () => ({
      employeeId: Number(currentUser?.employeeId),
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? null,
      authPic: currentUser?.authPic as string | null
    }),
    [currentUser]
  );

  useEffect(() => {
    // Only initialize once (while selectedOwner is still undefined) and only after data has loaded
    if (selectedOwner !== undefined || isNaN(currentUserAsOwner.employeeId))
      return;
    setSelectedOwner(currentUserAsOwner);
    setLastSelectedOwner(currentUserAsOwner);
    onOwnerChange(currentUserAsOwner.employeeId);
  }, [currentUserAsOwner, selectedOwner, onOwnerChange]);

  const { data: ownerLookupData, isFetching: isOwnerFetching } =
    useGetOwnerLookup(
      debouncedOwnerSearch,
      DEFAULT_LOOKUP_PAGE_SIZE,
      !isOwnerReadonly
    );

  const ownerDropdownItems: SearchableDropdownItem[] =
    ownerLookupData?.items?.map((owner) => ({
      id: String(owner.employeeId),
      content: (
        <AvatarChip
          avatarProps={{ ...toOwnerAvatarProps(owner), size: "sm" }}
          label={concatStrings([owner.firstName, owner.lastName ?? ""])}
        />
      )
    })) ?? [];

  const handleOwnerSelect = (ownerDropDownItem: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (owner) => String(owner.employeeId) === ownerDropDownItem.id
    );
    if (!owner) return;
    onOwnerChange(owner.employeeId);
    setSelectedOwner(owner);
    setLastSelectedOwner(owner);
    setOwnerSearch("");
  };

  const handleClearOwner = () => {
    onOwnerChange(null);
    setSelectedOwner(null);
    setOwnerSearch("");
  };

  const restoreLastOwnerIfEmpty = () => {
    if (selectedOwner || !lastSelectedOwner) return;
    setSelectedOwner(lastSelectedOwner);
    onOwnerChange(lastSelectedOwner.employeeId);
    setOwnerSearch("");
  };

  if (selectedOwner) {
    return (
      <div className="flex w-full flex-col gap-2">
        <span className="subtitle1 leading-normal inline-flex h-6 items-center">
          {translateText(["labels", "owner"])}
        </span>
        <div className="flex h-[3.125rem] items-center rounded-lg bg-gray-100 px-3">
          <AvatarChip
            label={concatStrings([
              selectedOwner.firstName,
              selectedOwner.lastName ?? ""
            ])}
            avatarProps={{ ...toOwnerAvatarProps(selectedOwner), size: "sm" }}
            showActionButton={!isOwnerReadonly}
            onActionClick={isOwnerReadonly ? undefined : handleClearOwner}
            actionIcon={isOwnerReadonly ? undefined : <CloseIcon />}
            actionButtonAriaLabel={translateText(["ariaLabels", "clearOwner"])}
          />
        </div>
      </div>
    );
  }

  if (isOwnerReadonly) return null;

  return (
    <SearchableDropdown
      id="add-contact-owner"
      name="owner"
      label={translateText(["labels", "owner"])}
      placeholder={translateText(["placeholders", "owner"])}
      items={ownerDropdownItems}
      value={ownerSearch}
      onChange={(e) => setOwnerSearch(e.target.value)}
      onSelect={handleOwnerSelect}
      onClose={() => {
        setOwnerSearch("");
        restoreLastOwnerIfEmpty();
      }}
      emptyMessage={
        isOwnerFetching ? undefined : (
          <p className="px-4 py-2 body2">
            {translateText(["emptyStates", "noOwners"])}
          </p>
        )
      }
    />
  );
};

export default OwnerLookupDropdown;
