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

export interface EmployeeOptionType extends EmployeeType {
  label: string;
  id: string | number;
}

interface Props {
  id: {
    autocomplete: string;
    textField: string;
  };
  name: string;
  options: EmployeeType[];
  value?: EmployeeOptionType | null;
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

const EmployeeAutocompleteSearch = ({
  id,
  options,
  name,
  value,
  isLoading = undefined,
  inputValue,
  onInputChange,
  onChange,
  placeholder = "",
  error,
  isDisabled = false,
  required = false,
  label,
  customStyles
}: Props) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const formattedOptions = useMemo((): EmployeeOptionType[] => {
    if (options && options.length > 0) {
      return options.map((option: EmployeeType) => ({
        ...option,
        label: `${option.firstName} ${option.lastName}`,
        id: option.employeeId
      }));
    }

    return [];
  }, [options]);

  const getTextColor = () => {
    if (error) {
      return theme.palette.error.contrastText;
    } else if (isDisabled) {
      return theme.palette.text.disabled;
    }
    return theme.palette.common.black;
  };

  return (
    <Autocomplete
      id={id.autocomplete}
      options={formattedOptions}
      value={value}
      loading={isLoading}
      inputValue={inputValue}
      onInputChange={(_event, value, reason) => onInputChange(value, reason)}
      onChange={(_event, value: EmployeeOptionType | null) => {
        if (value !== null) {
          const { label, id, ...selectedOption } = value;
          onChange(selectedOption);
        }
      }}
      getOptionLabel={(option: EmployeeOptionType) => option.label}
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
                variant="body1"
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
              <Typography
                role="alert"
                aria-live="assertive"
                variant="body2"
                sx={classes.error}
              >
                {error}
              </Typography>
            )}
          </Stack>
        );
      }}
    />
  );
};

export default EmployeeAutocompleteSearch;
