import {
  ButtonV2,
  CloseIcon,
  InputField,
  PopperProps
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";

interface Props {
  id: string;
  label: string;
  placeholder: string;
  selectedValue: string;
  onClear: () => void;
  isOpenOnFocus?: boolean;
  clearAriaLabel: string;
  fieldAriaLabel: string;
  searchValue: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  items: SearchableDropdownItem[];
  onSelect: (item: SearchableDropdownItem) => void;
  emptyMessage?: string;
  positionStrategy?: PopperProps["positionStrategy"];
}

const SelectableSearchField: React.FC<Props> = ({
  id,
  label,
  placeholder,
  selectedValue,
  onClear,
  clearAriaLabel,
  fieldAriaLabel,
  searchValue,
  onSearchChange,
  items,
  onSelect,
  emptyMessage,
  isOpenOnFocus = true,
  positionStrategy
}) => {
  if (selectedValue) {
    return (
      <InputField
        label={label}
        value={selectedValue}
        readOnly
        fullWidth
        variant="md"
        aria-label={fieldAriaLabel}
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
  }

  return (
    <SearchableDropdown
      id={id}
      label={label}
      placeholder={placeholder}
      value={searchValue}
      onChange={onSearchChange}
      items={items}
      onSelect={onSelect}
      emptyMessage={emptyMessage}
      isOpenOnFocus={isOpenOnFocus}
      positionStrategy={positionStrategy}
    />
  );
};

export default SelectableSearchField;
