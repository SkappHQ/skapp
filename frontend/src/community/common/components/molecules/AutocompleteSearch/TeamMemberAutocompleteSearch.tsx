import {
  Box,
  InputBase,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import Autocomplete, {
  AutocompleteRenderInputParams
} from "@mui/material/Autocomplete";
import { useMemo } from "react";

import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { EmployeeType } from "~community/people/types/EmployeeTypes";

import Icon from "../../atoms/Icon/Icon";
import AvatarChip from "../AvatarChip/AvatarChip";
import styles from "./styles";

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
  placeholder = "Search people",
  error,
  isDisabled = false,
  required = false,
  label,
  customStyles,
  clearInputValueAfterSelect = false
}: Props) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const getTextColor = () => {
    if (error) {
      return theme.palette.error.contrastText;
    } else if (isDisabled) {
      return theme.palette.text.disabled;
    }
    return theme.palette.common.black;
  };

  const formattedOptions = useMemo(() => {
    return options.map((option) => ({
      ...option,
      label: `${option.firstName} ${option.lastName}`,
      id: option.employeeId
    }));
  }, [options]);

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
    <Autocomplete
      id={id.autocomplete}
      options={formattedOptions}
      value={computedValue}
      inputValue={computedInputValue}
      onInputChange={(_event, newInputValue, reason) =>
        onInputChange(newInputValue, reason)
      }
      onChange={(_event, selectedValue) => {
        if (selectedValue !== null) {
          const { label, id, ...selectedOption } = selectedValue;
          onChange(selectedOption);

          if (clearInputValueAfterSelect) {
            onInputChange("", "reset");
          }
        }
      }}
      getOptionLabel={(option) => option.label}
      disabled={isDisabled}
      renderOption={(props, option) => {
        return (
          <Box component="li" {...props} sx={classes.optionWrapper}>
            <AvatarChip
              firstName={option?.firstName}
              lastName={option?.lastName}
              avatarUrl={option?.avatarUrl}
              chipStyles={classes.chip}
            />
          </Box>
        );
      }}
      renderInput={(params: AutocompleteRenderInputParams) => {
        return (
          <Stack sx={classes.wrapper} ref={params.InputProps.ref}>
            {label && (
              <Typography
                variant="h5"
                gutterBottom
                color={getTextColor()}
                sx={mergeSx([classes.label, customStyles?.label])}
              >
                {label}{" "}
                {required && (
                  <Typography component="span" sx={classes.asterisk}>
                    *
                  </Typography>
                )}
              </Typography>
            )}
            <InputBase
              {...params}
              id={id.textField}
              placeholder={placeholder}
              error={!!error}
              name={name}
              sx={classes.inputBase}
              endAdornment={<Icon name={IconName.SEARCH_ICON} />}
            />
            {!!error && (
              <Typography variant="body2" sx={classes.error}>
                {error}
              </Typography>
            )}
          </Stack>
        );
      }}
    />
  );
};

export default TeamMemberAutocompleteSearch;
