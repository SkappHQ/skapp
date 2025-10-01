import {
  Box,
  InputBase,
  InputBaseComponentProps,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { SxProps, useTheme } from "@mui/material/styles";
import {
  CSSProperties,
  ChangeEvent,
  ClipboardEvent,
  JSX,
  KeyboardEvent
} from "react";

import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { matchWhitespace } from "~community/common/regex/regexPatterns";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

interface Props {
  focusOnText?: boolean;
  tooltipId?: string;
  id?: string;
  readOnly?: boolean;
  label?: string;
  inputType?: "password" | "text" | "email" | "number";
  inputName: string;
  inputStyle?: SxProps;
  tooltipStyles?: SxProps;
  value: string | number | boolean | undefined;
  helperText?: string;
  placeHolder?: string;
  inputProps?: InputBaseComponentProps;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onInput?: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onFocus?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void | Promise<void>;
  onBlur?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void | Promise<void>;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void | Promise<void>;
  error?: string | boolean;
  helperTxtStyles?: SxProps;
  componentStyle?: SxProps;
  inputBaseStyle?: SxProps;
  tooltip?: string;
  isDisabled?: boolean;
  labelStyles?: SxProps;
  onMouseEnter?: () => void | Promise<void>;
  onMouseLeave?: () => void | Promise<void>;
  startAdornment?: JSX.Element | null;
  endAdornment?: JSX.Element | null;
  isMulti?: boolean;
  commonProp?: Record<string, string>;
  open?: boolean;
  onTooltipBlur?: () => void | Promise<void>;
  onTooltipHover?: () => void | Promise<void>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void | Promise<void>;
  min?: number;
  max?: number;
  maxLength?: number;
  required?: boolean;
  inputMode?: "numeric" | "text";
  showAsterisk?: boolean;
  "data-testid"?: string;
  "validation-testid"?: string;
  keepHelperTextColor?: boolean;
  ariaLabel?: string;
  centerError?: boolean;
}

const InputField = ({
  focusOnText,
  tooltipId,
  tooltipStyles,
  id,
  readOnly,
  label,
  inputType = "text",
  inputStyle,
  inputName,
  helperText,
  placeHolder,
  value,
  inputProps,
  onChange,
  error,
  onMouseEnter,
  onMouseLeave,
  onPaste,
  componentStyle,
  inputBaseStyle,
  helperTxtStyles,
  tooltip,
  isDisabled = false,
  labelStyles,
  startAdornment = null,
  endAdornment = null,
  onInput,
  onFocus,
  onBlur,
  isMulti = false,
  commonProp,
  open,
  onTooltipHover,
  onTooltipBlur,
  onKeyDown,
  min,
  max,
  maxLength,
  required,
  inputMode,
  showAsterisk = true,
  keepHelperTextColor = false,
  "data-testid": testId,
  "validation-testid": validationTestId,
  ariaLabel,
  centerError = false
}: Props): JSX.Element => {
  const theme = useTheme();
  const classes = styles(theme);

  // TODO: Refactor this to a util function and write test cases for it, also try to use switch instead of if else
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (inputType === "password") {
      value = value.replace(matchWhitespace(), "");
    } else if (inputType === "number") {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        if (min !== undefined && numericValue < min) value = min.toString();
        if (max !== undefined && numericValue > max) value = max.toString();
      }
    } else if (inputType === "text" || inputType === "email") {
      value = value.trimStart();
    }

    if (!maxLength || maxLength >= value.length) {
      e.target.value = value;
      onChange?.(e);
    }
  };

  // TODO: Refactor this to a separate function
  const renderInputBase = () => (
    <InputBase
      id={id}
      data-cy={inputName}
      inputRef={(input) => input && focusOnText && input.focus()}
      readOnly={readOnly}
      inputMode={inputMode}
      onKeyDown={onKeyDown}
      name={inputName}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type={inputType}
      placeholder={placeHolder}
      sx={mergeSx([classes.defaultInputBaseStyles, inputBaseStyle])}
      value={value}
      onChange={handleOnChange}
      onInput={onInput}
      disabled={isDisabled}
      onFocus={onFocus}
      onBlur={onBlur}
      onPaste={onPaste}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      inputProps={{
        "aria-label": ariaLabel ? ariaLabel : label,
        "aria-invalid": !!error,
        "data-testid": testId,
        "aria-required": required,
        ...(inputType === "number" && { min, max }),
        ...inputProps
      }}
    />
  );

  return (
    // TODO: Check if the below code could be improved
    // TODO: Use Stack instead of Box if display is flex
    <Box sx={componentStyle} {...commonProp}>
      <Stack sx={mergeSx([classes.labelWrapper, tooltipStyles])}>
        <Typography
          component="label"
          sx={mergeSx([
            {
              color: isDisabled
                ? theme.palette.grey[700]
                : error
                  ? theme.palette.error.contrastText
                  : theme.palette.common.black
            },
            labelStyles
          ])}
        >
          {label}{" "}
          {required && showAsterisk && !isDisabled && (
            <Typography
              component="span"
              style={classes.requiredSpan as CSSProperties}
            >
              *
            </Typography>
          )}
        </Typography>
        {tooltip && (
          // TODO: Use Stack instead of Box if display is flex
          <Box
            sx={{
              ...classes.tooltipWrapper,
              [theme.breakpoints.down("sm")]: {
                position: "relative",
                zIndex: ZIndexEnums.DEFAULT
              }
            }}
            onMouseOver={onTooltipHover}
            onMouseLeave={onTooltipBlur}
          >
            <Tooltip
              error={!!error}
              isDisabled={isDisabled}
              title={tooltip}
              open={open}
              id={tooltipId}
              ariaDescription={tooltip}
              maxWidth={theme.breakpoints.down("sm") ? "18rem" : "31.25rem"}
            />
          </Box>
        )}
      </Stack>
      <Paper
        elevation={0}
        sx={mergeSx([
          {
            bgcolor: error ? theme.palette.error.light : "grey.100",
            pl: isMulti ? "0.5rem" : "0rem",
            border: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none"
          },
          classes.defaultInputStyles,
          inputStyle
        ])}
      >
        {isMulti && value ? (
          // TODO: Use Stack instead of Box if display is flex and remove the second box if not needed
          <Box sx={classes.multiValueOuterBox}>
            <Box>
              {String(value)
                .split(",")
                .map((item, key) => (
                  <BasicChip
                    chipStyles={classes.multiValueBasicChip}
                    key={key}
                    label={item}
                  />
                ))}
            </Box>
            {endAdornment}
          </Box>
        ) : (
          renderInputBase()
        )}
      </Paper>
      {!!helperText && (
        <Typography
          variant="body2"
          sx={mergeSx([
            {
              color:
                error && !keepHelperTextColor
                  ? theme.palette.error.contrastText
                  : theme.palette.text.darkText
            },
            classes.defaultHelperTextStyles,
            helperTxtStyles
          ])}
        >
          {helperText}
        </Typography>
      )}
      {!!error && (
        <Box
          sx={{
            mt: "0.5rem",
            textAlign: centerError ? "center" : "left"
          }}
          role="alert"
          aria-live="assertive"
          aria-atomic={true}
        >
          <Typography
            variant="body2"
            sx={classes.errorTypography}
            data-testid={validationTestId}
          >
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InputField;
