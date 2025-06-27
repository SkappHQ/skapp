import {
  Box,
  Divider,
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

import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import Icon from "../../atoms/Icon/Icon";
import AvatarChip from "../AvatarChip/AvatarChip";
import styles from "./styles";

export interface OptionType {
  value: number;
  label: string;
  category: string;
  firstName?: string;
  lastName?: string;
  authPic?: string;
  teamName?: string;
}

interface Props {
  id: {
    autocomplete: string;
    textField: string;
  };
  name: string;
  options: OptionType[];
  value?: OptionType | null;
  inputValue: string;
  onInputChange: (value: string, reason: string) => void;
  onChange: (value: OptionType | null) => void;
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

const PeopleAndTeamAutocompleteSearch = ({
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
      options={options}
      groupBy={(option) => option.category}
      value={value}
      loading={isLoading}
      inputValue={inputValue}
      onInputChange={(_event, value, reason) => onInputChange(value, reason)}
      onChange={(_event, value: OptionType | null) => onChange(value)}
      getOptionLabel={(option: OptionType) => option.label}
      disabled={isDisabled}
      slotProps={{
        paper: {
          sx: {
            "& .MuiAutocomplete-option": {
              padding: "8px 4px"
            }
          }
        }
      }}
      renderGroup={(params) => (
        <li
          role="list"
          key={params.key}
          style={{
            padding: "0rem 1rem"
          }}
        >
          <Box sx={classes.group}>
            <Typography variant="label" sx={classes.groupHeader}>
              {params.group}
            </Typography>
          </Box>
          <Divider aria-hidden={true} />
          <Box sx={classes.children}> {params.children}</Box>
        </li>
      )}
      renderOption={(props, option) => {
        if (option.category === "Teams") {
          return (
            <Box component="li" {...props} sx={classes.optionWrapperWithoutBg}>
              <Typography variant="body1">{option.teamName}</Typography>
            </Box>
          );
        }

        return (
          <Box component="li" {...props} sx={classes.optionWrapperWithoutBg}>
            <AvatarChip
              firstName={option?.firstName ?? ""}
              lastName={option?.lastName ?? ""}
              avatarUrl={option?.authPic}
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

export default PeopleAndTeamAutocompleteSearch;
