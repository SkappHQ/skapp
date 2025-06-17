import { Stack, Typography } from "@mui/material";
import { SxProps, type Theme, useTheme } from "@mui/material/styles";
import { ChangeEvent, FC, KeyboardEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import StyledSwitch from "./StyledSwitch";
import styles from "./styles";

interface SwitchComponentProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean, type?: string) => void;
  type?: string;
  disabled?: boolean;
  error?: string;
  wrapperStyles?: SxProps<Theme>;
  name?: string;
  icon?: IconName;
  labelId: string;
  arialabel?: string;
}

const SwitchRow: FC<SwitchComponentProps> = ({
  label,
  checked,
  type,
  onChange,
  disabled = false,
  error,
  wrapperStyles,
  name,
  icon,
  labelId,
  arialabel
}) => {
  const translateAria = useTranslator("commonAria", "components", "switch");

  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack sx={mergeSx([classes.wrapper, wrapperStyles])}>
      {!!label && (
        <Typography
          sx={{
            ...classes.label,
            color: disabled
              ? theme.palette.grey.A100
              : theme.palette.common.black
          }}
          id={labelId}
          component="label"
        >
          {label}
          {!!icon && <Icon name={icon} />}
        </Typography>
      )}
      <StyledSwitch
        disableRipple
        checked={checked}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.checked, type)
        }
        disabled={disabled}
        name={name}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          if (shouldActivateButton(e.key)) {
            onChange?.(e.target.checked, type);
          }
        }}
        slotProps={{
          input: {
            "aria-labelledby": labelId,
            "aria-label": arialabel ? arialabel : translateAria(["ariaLabel"])
          }
        }}
      />
      {!!error && (
        <Typography variant="body2" sx={classes.error}>
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default SwitchRow;
