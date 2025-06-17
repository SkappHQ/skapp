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
  isLoading?: boolean;
  error?: string;
  isDisabled: boolean;
  required: boolean;
  label: string;
  customStyles?: {
    label?: SxProps<Theme>;
  };
}

const PeopleAutocompleteSearch = ({
  id,
  options,
  name,
  value,
  isLoading = undefined,
  inputValue,
  onInputChange,
  onChange,
  placeholder,
  error,
  isDisabled = false,
  required = false,
  label,
  customStyles
}: Props) => {
  const computedInputValue = useMemo(() => {
    if (value) {
      return `${value.firstName} ${value.lastName}`;
    }

    return inputValue;
  }, [value, inputValue]);

  return (
    <EmployeeAutocompleteSearch
      id={id}
      options={options}
      isLoading={isLoading}
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
    />
  );
};

export default PeopleAutocompleteSearch;
