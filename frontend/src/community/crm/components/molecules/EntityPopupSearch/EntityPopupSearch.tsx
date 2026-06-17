import {
  DropdownValue,
  DropdownWithSearchablePopup
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption, TriggerProps } from "@rootcodelabs/skapp-ui";
import { ReactNode, useMemo } from "react";

export interface EntityPopupSearchProps<T> {
  items: T[];
  selectedItem: T | null;
  getItemId: (item: T) => number;
  getItemLabel: (item: T) => string;
  onChange: (item: T | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
  renderTrigger: (item: T | null, triggerProps: TriggerProps) => ReactNode;
  renderOption?: (
    item: T,
    option: DropdownOption,
    onSelect: (opt: DropdownOption) => void
  ) => ReactNode;
}

function EntityPopupSearch<T>({
  items,
  selectedItem,
  getItemId,
  getItemLabel,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid,
  renderTrigger,
  renderOption
}: Readonly<EntityPopupSearchProps<T>>) {
  const options: DropdownOption[] = useMemo(() => {
    const searchResults = items?.map((item) => ({
      id: getItemId(item),
      value: getItemId(item),
      label: getItemLabel(item)
    }));

    if (
      selectedItem &&
      !items.some((item) => getItemId(item) === getItemId(selectedItem))
    ) {
      return [
        {
          id: getItemId(selectedItem),
          value: getItemId(selectedItem),
          label: getItemLabel(selectedItem)
        },
        ...searchResults
      ];
    }
    return searchResults;
  }, [items, selectedItem]);

  const selectedValue: DropdownOption | null = selectedItem
    ? {
        id: getItemId(selectedItem),
        value: getItemId(selectedItem),
        label: getItemLabel(selectedItem)
      }
    : null;

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const { id } = val as DropdownOption;
    const item =
      items?.find((i) => getItemId(i) === id) ??
      (selectedItem && getItemId(selectedItem) === id ? selectedItem : null);
    onChange(item);
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
      renderTrigger={(_val, _isOpen, _disabled, triggerProps) =>
        renderTrigger(selectedItem, triggerProps)
      }
      renderOption={(option, _index, onSelect) => {
        const opt = option as DropdownOption;
        const id = Number(opt.id);
        const item =
          items.find((i) => getItemId(i) === id) ??
          (selectedItem && getItemId(selectedItem) === id
            ? selectedItem
            : null);
        if (!item) return null;
        if (renderOption) {
          return renderOption(item, opt, onSelect);
        }
        return (
          <button
            type="button"
            className="px-4 py-2 text-sm hover:bg-tertiary-background cursor-pointer w-full text-left"
            onClick={() => onSelect(opt)}
          >
            {opt.label}
          </button>
        );
      }}
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-tertiary-text">
          {noResultsText}
        </div>
      )}
    />
  );
}

export default EntityPopupSearch;
