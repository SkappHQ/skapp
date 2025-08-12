import { Box, Stack, Theme, Typography, useTheme } from "@mui/material";
import { ChangeEvent, KeyboardEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import StyledTextArea from "./StyledTextArea";
import styles from "./styles";

interface Props<T> {
  label: string;
  name: string;
  placeholder?: string;
  isRequired?: boolean;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: {
    comment?: string | undefined;
    attachment?: string | undefined;
  };
  isAttachmentRequired?: boolean;
  maxLength?: number;
  iconName?: IconName;
  onIconClick?: () => void;
  ariaLabel?: {
    icon?: string;
    textArea?: string;
  };
  isErrorTopicColor?: boolean;
  textColor?: string;
}

const TextArea = <T,>({
  label,
  name,
  placeholder = "",
  isRequired = true,
  value,
  onChange,
  error,
  maxLength,
  isAttachmentRequired = false,
  iconName,
  ariaLabel,
  onIconClick,
  isErrorTopicColor = true,
  textColor
}: Props<T>) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack sx={classes.wrapper}>
      <Stack sx={classes.container}>
        <Typography
          variant="body1"
          sx={error?.comment && isErrorTopicColor ? classes.error : {}}
        >
          {label} &nbsp;
          {isRequired && (
            <Typography component="span" sx={classes.asterisk}>
              *
            </Typography>
          )}
        </Typography>
        <Stack
          sx={{
            ...classes.field,
            border: error?.comment
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none"
          }}
        >
          <StyledTextArea
            maxLength={maxLength}
            name={name}
            aria-label={ariaLabel?.textArea ?? label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            textColor={textColor}
          />
          {iconName && (
            <Box
              tabIndex={0}
              role="button"
              onClick={onIconClick}
              onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                if (shouldActivateButton(e.key)) {
                  onIconClick?.();
                }
              }}
              sx={{
                height: "min-content",
                width: "min-content",
                cursor: "pointer"
              }}
              aria-label={ariaLabel?.icon ?? ""}
            >
              <Icon
                name={iconName}
                fill={
                  isAttachmentRequired && error?.attachment
                    ? theme.palette.error.contrastText
                    : theme.palette.common.black
                }
              />
            </Box>
          )}
        </Stack>
      </Stack>
      {!!error && (
        <Typography role="alert" variant="caption" sx={classes.error}>
          {error.comment || error.attachment}
        </Typography>
      )}
    </Stack>
  );
};

export default TextArea;
