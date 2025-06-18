import { SxProps, Theme } from "@mui/material";
import { useMemo } from "react";

import { EmployeeType } from "~community/people/types/EmployeeTypes";

import EmployeeAutocompleteSearch from "./EmployeeAutocompleteSearch";

interface Props {
  id: {
    autocomplete: string;
    textField: string;
  };
  name: string;
  options: EmployeeType[];
  value?: EmployeeType;
  inputValue: string;
  onInputChange: (value: string, reason: string) => void;
  onChange: (value: EmployeeType) => void;
  placeholder: string;
  error?: string;
  isDisabled: boolean;
  required: boolean;
  label: string;
  customStyles?: {
    label?: SxProps<Theme>;
  };
  clearInputValueAfterSelect?: boolean;
}

const TeamMemberAutocompleteSearch = ({
  id,
  options,
  name,
  value,
  inputValue,
  onInputChange,
  onChange,
  placeholder,
  error,
  isDisabled = false,
  required = false,
  label,
  customStyles,
  clearInputValueAfterSelect = false
}: Props) => {
  const computedInputValue = useMemo(() => {
    if (clearInputValueAfterSelect) {
      return inputValue;
    }

    if (value) {
      return `${value.firstName} ${value.lastName}`;
    }

    return inputValue;
  }, [value, inputValue, clearInputValueAfterSelect]);

  const computedValue = useMemo(() => {
    if (clearInputValueAfterSelect) {
      return null;
    }

    if (value) {
      return {
        ...value,
        label: `${value.firstName} ${value.lastName}`,
        id: value.employeeId
      };
    }

    return null;
  }, [value, clearInputValueAfterSelect]);

  return (
    <EmployeeAutocompleteSearch
      id={id}
      options={options}
      inputValue={computedInputValue}
      onInputChange={onInputChange}
      onChange={onChange}
      customStyles={customStyles}
      placeholder={placeholder}
      error={error}
      isDisabled={isDisabled}
      required={required}
      label={label}
      name={name}
      value={computedValue}
    />
  );
};

export default TeamMemberAutocompleteSearch;
