import {
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  Typography,
  useTheme
} from "@mui/material";
import { ReactNode } from "react";

import { IconName } from "~community/common/types/IconTypes";

import Icon from "../../atoms/Icon/Icon";

interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface Props {
  id: string;
  onChange: (event: SelectChangeEvent) => void;
  options: DropdownOption[];
  value: string;
  disabled?: boolean;
  name?: string;
  renderValue?: (value: string) => ReactNode;
  accessibility?: {
    label?: string;
    description?: string;
  };
}

const Select = ({
  id,
  value,
  options,
  onChange,
  renderValue,
  disabled = false,
  name,
  accessibility
}: Props) => {
  const theme = useTheme();

  return (
    <MuiSelect
      id={id}
      value={value}
      renderValue={(selectedValue) => {
        const selectedOption = options.find(
          (option) => option.value.toString() === selectedValue
        );

        const label = selectedOption ? selectedOption?.label : "";

        if (renderValue === undefined) {
          return (
            <Typography aria-label={`${accessibility?.label ?? ""} ${label}`}>
              {label}
            </Typography>
          );
        }

        return renderValue?.(label);
      }}
      disabled={disabled}
      name={name}
      onChange={(event: SelectChangeEvent) => onChange(event)}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: "0.75rem"
          },
          "& .MuiMenu-list": {
            padding: "0rem"
          }
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
          }
        }
      }}
      sx={{
        borderRadius: "2.1875rem",
        "& .MuiSelect-select": {
          padding: "0.75rem 2.5rem 0.75rem 1.25rem"
        }
      }}
    >
      {options?.map((option) => {
        const selected = value === option.value.toString();

        return (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option?.disabled ?? false}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: "9.375rem"
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

export default Select;
