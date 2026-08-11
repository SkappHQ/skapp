import { Stack, Typography } from "@mui/material";
import { SxProps, type Theme, useTheme } from "@mui/material/styles";
import { Toggle } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

interface SwitchComponentProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean, type?: string) => void;
  type?: string;
  disabled?: boolean;
  error?: string;
  wrapperStyles?: SxProps<Theme>;
  icon?: IconName;
  tooltip?: string;
  labelId: string;
  arialabel?: string;
  arialabelChecked?: string;
  arialabelUnchecked?: string;
}

const SwitchRow: FC<SwitchComponentProps> = ({
  label,
  checked,
  type,
  onChange,
  disabled = false,
  error,
  wrapperStyles,
  icon,
  tooltip,
  labelId,
  arialabel,
  arialabelChecked,
  arialabelUnchecked
}) => {
  const translateAria = useTranslator("commonAria", "components", "switch");

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const getAriaLabel = () => {
    if (checked && arialabelChecked) return arialabelChecked;
    if (!checked && arialabelUnchecked) return arialabelUnchecked;
    return arialabel ?? label ?? translateAria(["ariaLabel"]);
  };

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
          {!!tooltip && <Tooltip title={tooltip} isDisabled={disabled} />}
        </Typography>
      )}
      <Toggle
        checked={checked}
        onChange={(val) => onChange(val, type)}
        disabled={disabled}
        ariaLabel={getAriaLabel()}
      />
      {!!error && (
        <Typography
          variant="body2"
          sx={classes.error}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default SwitchRow;
