import { CircularProgress } from "@mui/material";
import {
  DropdownWithSearchablePopup,
  DropdownValue
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { FC, useCallback, useRef } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

interface Props {
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  placeholder: string;
  searchPlaceholder: string;
  ariaInvalid?: boolean;
}

const ContactPopupSearch: FC<Props> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  placeholder,
  searchPlaceholder,
  ariaInvalid
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node || !hasNextPage) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const options: DropdownOption[] = contacts.map((c) => ({
    id: c.id,
    value: c.id,
    label: c.name
  }));

  const selectedValue: DropdownOption | null = selectedContact
    ? { id: selectedContact.id, value: selectedContact.id, label: selectedContact.name }
    : null;

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const id =
      typeof val === "object"
        ? Number(val.id)
        : Number(val);
    const contact = contacts.find((c) => c.id === id) ?? null;
    onChange(contact);
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedValue}
      onChange={handleChange}
      onSearch={onSearch}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      searchable
      clearable
      ariaInvalid={ariaInvalid}
      width="100%"
      renderOption={(option, index, onSelect) => {
        const opt = option as DropdownOption;
        const isLast = hasNextPage && index === contacts.length - 1;
        return (
          <button
            type="button"
            ref={isLast ? sentinelRef : undefined}
            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer w-full text-left"
            onClick={() => onSelect(option)}
          >
            {typeof opt.label === "string" ? opt.label : ""}
          </button>
        );
      }}
      renderNoResults={() =>
        isFetchingNextPage ? (
          <div className="flex justify-center py-3">
            <CircularProgress size={16} />
          </div>
        ) : (
          <div className="px-4 py-2 text-sm text-gray-400">No results</div>
        )
      }
    />
  );
};

export default ContactPopupSearch;
