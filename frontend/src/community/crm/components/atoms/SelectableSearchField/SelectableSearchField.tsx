import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";

interface SelectableSearchFieldProps {
  id: string;
  label: string;
  placeholder: string;
  selectedValue: number | string | null | undefined;
  selectedLabel: string;
  searchText: string;
  items: SearchableDropdownItem[];
  onSelect: (item: SearchableDropdownItem) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  isFetching: boolean;
  emptyMessage: string;
  inputAriaLabel: string;
  clearAriaLabel: string;
  emptyStateContent?: ReactNode;
}

const SelectableSearchField: FC<SelectableSearchFieldProps> = ({
  id,
  label,
  placeholder,
  selectedValue,
  selectedLabel,
  searchText,
  items,
  onSelect,
  onSearchChange,
  onClear,
  isFetching,
  emptyMessage,
  inputAriaLabel,
  clearAriaLabel,
  emptyStateContent
}) => {
  if (selectedValue == null) {
    return (
      <SearchableDropdown
        id={id}
        label={label}
        placeholder={placeholder}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        items={items}
        onSelect={onSelect}
        onClose={() => onSearchChange("")}
        emptyMessage={
          isFetching
            ? undefined
            : (emptyStateContent ?? (
                <p className="px-4 py-2 body2">{emptyMessage}</p>
              ))
        }
      />
    );
  }

  return (
    <InputField
      label={label}
      value={selectedLabel}
      readOnly
      fullWidth
      variant="md"
      aria-label={inputAriaLabel}
      rightIcon={
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={onClear}
          aria-label={clearAriaLabel}
          icon={<CloseIcon />}
        />
      }
    />
  );
};

export default SelectableSearchField;
