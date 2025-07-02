import {
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
  useTheme
} from "@mui/material";
import { ReactNode } from "react";

import { IconName } from "~community/common/types/IconTypes";

import Icon from "../../atoms/Icon/Icon";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  ariaLabel?: string;
}

interface Props {
  id: string;
  onChange: (event: SelectChangeEvent, child?: ReactNode) => void;
  options: SelectOption[];
  value: string;
  disabled?: boolean;
  name?: string;
  renderValue?: (value: string) => ReactNode;
  accessibility?: {
    label?: string;
    description?: string;
  };
  customStyles?: {
    label?: SxProps<Theme>;
    select?: SxProps<Theme>;
    menuItem?: SxProps<Theme>;
    menuProps?: {
      sx?: SxProps<Theme>;
      paperProps?: {
        sx?: SxProps<Theme>;
      };
    };
  };
  variant?: TypographyProps["variant"];
}

const RoundedSelect = ({
  id,
  value,
  options,
  onChange,
  renderValue,
  disabled = false,
  name,
  accessibility = {
    label: "",
    description: ""
  },
  customStyles = {},
  variant = "body1"
}: Props) => {
  const theme = useTheme();

  return (
    <MuiSelect
      id={id}
      value={value}
      renderValue={(selectedValue) => {
        if (renderValue === undefined) {
          return (
            <Typography
              variant={variant}
              aria-label={`${accessibility?.label ?? ""} ${selectedValue}`}
              sx={customStyles?.label}
            >
              {selectedValue}
            </Typography>
          );
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
          sx: {
            borderRadius: "0.75rem"
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
              borderRadius: "0.75rem",
              color: theme.palette.primary.dark,
              svg: {
                fill: theme.palette.primary.dark,
                path: {
                  fill: theme.palette.primary.dark
                }
              }
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
        borderRadius: "2.1875rem",
        "& .MuiSelect-select": {
          padding: "0.75rem 2.5rem 0.75rem 1.25rem"
        },
        ...customStyles?.select
      }}
      inputProps={{
        "aria-label": accessibility?.label
      }}
    >
      {options?.map((option) => {
        const selected = value === option?.value?.toString();

        return (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option?.disabled ?? false}
            aria-label={option.ariaLabel}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: "9.375rem",
              ...customStyles?.menuItem
            }}
            selected={selected}
          >
            {option.label}
            {selected && (
              <Icon name={IconName.CHECK_CIRCLE_ICON} fill="primary.dark" />
            )}
          </MenuItem>
        );
      })}
    </MuiSelect>
  );
};

export default RoundedSelect;
