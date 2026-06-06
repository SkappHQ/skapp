import { CircularProgress } from "@mui/material";
import {
  DropdownWithSearchablePopup,
  DropdownValue
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { FC, useCallback, useRef } from "react";

import { CompanyLookup } from "~community/crm/types/CommonTypes";

interface Props {
  companies: CompanyLookup[];
  selectedCompany: CompanyLookup | null;
  onChange: (company: CompanyLookup | null) => void;
  onSearch: (term: string) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  placeholder: string;
  searchPlaceholder: string;
}

const CompanyPopupSearch: FC<Props> = ({
  companies,
  selectedCompany,
  onChange,
  onSearch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  placeholder,
  searchPlaceholder
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

  const options: DropdownOption[] = companies.map((c) => ({
    id: c.id,
    value: c.id,
    label: c.name
  }));

  const selectedValue: DropdownOption | null = selectedCompany
    ? { id: selectedCompany.id, value: selectedCompany.id, label: selectedCompany.name }
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
    const company = companies.find((c) => c.id === id) ?? null;
    onChange(company);
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
      width="100%"
      renderOption={(option, index, onSelect) => {
        const opt = option as DropdownOption;
        const isLast = hasNextPage && index === companies.length - 1;
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

export default CompanyPopupSearch;
