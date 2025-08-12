import {
  FormHelperText,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { ReactNode } from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface Props {
  id: string;
  onChange: (event: SelectChangeEvent, child?: ReactNode) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  value: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  renderValue?: (value: string) => ReactNode;
  customStyles?: {
    select?: SxProps<Theme>;
    menuItem?: SxProps<Theme>;
    menuProps?: {
      sx?: SxProps<Theme>;
      paperProps?: {
        sx?: SxProps<Theme>;
      };
    };
  };
  error?: string;
  accessibility?: {
    ariaLabel?: string;
  };
}

const SquareSelect = ({
  id,
  value,
  label,
  placeholder = "",
  required,
  options,
  onChange,
  renderValue,
  disabled = false,
  name,
  error,
  customStyles = {},
  accessibility
}: Props) => {
  const theme = useTheme();

  return (
    <FormControl error={Boolean(error)}>
      <Typography variant="body1">
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </Typography>
      <MuiSelect
        id={id}
        displayEmpty
        value={value}
        renderValue={(selectedValue) => {
          if (renderValue === undefined) {
            const optionLabel = options.find(
              (option) => option.value.toString() === selectedValue
            )?.label;

            if (optionLabel === undefined) {
              return (
                <Typography variant="body1" color={theme.palette.grey[600]}>
                  {placeholder}
                </Typography>
              );
            }

            return <Typography variant="body1">{optionLabel}</Typography>;
          }

          return renderValue?.(selectedValue);
        }}
        disabled={disabled}
        name={name}
        onChange={(event: SelectChangeEvent, child?: ReactNode) =>
          onChange(event, child)
        }
        MenuProps={{
          PaperProps: {
            sx: {},
            style: {
              maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
            },
            "& .MuiMenu-list": {
              padding: "0rem"
            },
            ...customStyles?.menuProps?.paperProps?.sx
          },
          sx: {
            "& .MuiMenuItem-root": {
              padding: "0.75rem 1.25rem",
              minWidth: "9.375rem",
              "&.Mui-selected": {
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.primary.dark
              },
              "&.Mui-disabled": {
                backgroundColor: theme.palette.grey[100],
                color: theme.palette.grey.A100
              }
            },
            ...customStyles?.menuProps?.sx
          }
        }}
        sx={{
          borderRadius: "0.5rem",
          backgroundColor: theme.palette.grey[100],
          "& .MuiSelect-select": {
            padding: "0.75rem 2.5rem 0.75rem 1.25rem"
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none"
          },
          "&.MuiInputBase-root": {
            marginTop: "0.5rem"
          },
          "& .MuiSelect-select:focus-visible": {
            outline: `0.125rem solid ${theme.palette.common.black}`,
            outlineOffset: "-0.125rem",
            borderRadius: "0.5rem"
          },
          ...customStyles?.select
        }}
        inputProps={{
          "aria-label": accessibility?.ariaLabel
        }}
      >
        {options?.map((option) => {
          const selected = value === option?.value?.toString();

          return (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option?.disabled ?? false}
              sx={{
                display: "flex",
                minWidth: "9.375rem",
                ...customStyles?.menuItem
              }}
              selected={selected}
            >
              {option.label}
            </MenuItem>
          );
        })}
      </MuiSelect>
      <FormHelperText role="alert" aria-live="assertive">
        {error}
      </FormHelperText>
    </FormControl>
  );
};

export default SquareSelect;
