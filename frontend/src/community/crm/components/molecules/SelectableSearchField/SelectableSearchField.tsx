import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC } from "react";

import SearchableDropdown, {
  SearchableDropdownItem,
  SearchableDropdownProps
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
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  items: SearchableDropdownItem[];
  onSelect: (item: SearchableDropdownItem) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  describedById?: string;
  required?: boolean;
  errorMessage?: string;
  positionStrategy?: NonNullable<SearchableDropdownProps["positionStrategy"]>;
  isFlip?: boolean;
}

const SelectableSearchField: FC<Props> = ({
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
  loadingMessage,
  describedById,
  isOpenOnFocus = true,
  required = false,
  errorMessage,
  positionStrategy = "absolute",
  isFlip = true
}) => {
  if (selectedValue) {
    return (
      <InputField
        label={label}
        value={selectedValue}
        title={selectedValue}
        required={required}
        readOnly
        fullWidth
        variant="md"
        aria-label={fieldAriaLabel}
        {...(describedById && { "aria-describedby": describedById })}
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
      {...(loadingMessage && { loadingMessage })}
      isOpenOnFocus={isOpenOnFocus}
      required={required}
      state={errorMessage ? "error" : "default"}
      errorMessage={errorMessage}
      positionStrategy={positionStrategy}
      isFlip={isFlip}
    />
  );
};

export default SelectableSearchField;
