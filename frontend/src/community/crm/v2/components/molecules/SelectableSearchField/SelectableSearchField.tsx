import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import SearchableDropdown, {
  SearchableDropdownProps
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";

interface SelectableSearchFieldProps extends SearchableDropdownProps {
  selectedValue?: string;
  onClear: () => void;
  clearAriaLabel: string;
  fieldAriaLabel: string;
}

const SelectableSearchField: FC<SelectableSearchFieldProps> = ({
  selectedValue,
  onClear,
  clearAriaLabel,
  fieldAriaLabel,
  isOpenOnFocus = true,
  ...dropdownProps
}) => {
  if (selectedValue) {
    return (
      <InputField
        label={dropdownProps.label}
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
    <SearchableDropdown {...dropdownProps} isOpenOnFocus={isOpenOnFocus} />
  );
};

export default SelectableSearchField;
