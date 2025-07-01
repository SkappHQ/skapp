import {
  FormControlLabel,
  Checkbox as MuiCheckbox,
  SxProps,
  useTheme
} from "@mui/material";
import { JSX } from "react";

interface Props {
  checked: boolean;
  name: string;
  onChange: () => void;
  disabled?: boolean;
  label: string | JSX.Element;
  size?: "small" | "medium" | "large"; // TODO: create an enum for this
  labelStyles?: SxProps;
  customStyles?: SxProps;
  ariaLabel?: string;
  tabIndex?: number;
}

const Checkbox = ({
  checked,
  onChange,
  name,
  disabled = false,
  label,
  size = "medium",
  labelStyles,
  customStyles,
  ariaLabel,
  tabIndex
}: Props) => {
  const theme = useTheme();

  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          sx={{
            color: theme.palette.primary.main,
            ...customStyles
          }}
          size={size}
          slotProps={{
            input: {
              "aria-label": ariaLabel
            }
          }}
          tabIndex={tabIndex}
        />
      }
      label={label}
      sx={labelStyles}
    />
  );
};

export default Checkbox;
