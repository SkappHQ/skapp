import {
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Theme, useTheme } from "@mui/material/styles";
import { Box, SxProps } from "@mui/system";
import { FC, JSX, KeyboardEvent, SyntheticEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  shouldCollapseDropdown,
  shouldExpandDropdown
} from "~community/common/utils/keyboardUtils";

import { styles } from "./styles";

interface Props {
  label?: string;
  placeholder?: string;
  inputName: string;
  inputStyle?: SxProps;
  value?: string | number;
  onChange?: (
    event:
      | SelectChangeEvent
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onInput?: (
    event:
      | SelectChangeEvent
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClose?: (event: SyntheticEvent) => void;
  error?: string;
  componentStyle?: SxProps;
  isDisabled?: boolean;
  itemList: DropdownListType[];
  tooltip?: string | JSX.Element;
  toolTipWidth?: string;
  isMultiValue?: boolean;
  paperStyles?: Record<string, string | number>;
  selectStyles?: SxProps;
  toolTipId?: string;
  id?: string;
  onAddNewClickBtn?: () => void;
  addNewClickBtnText?: string;
  required?: boolean;
  emojiWithText?: boolean;
  readOnly?: boolean;
  errorFocusOutlineNeeded?: boolean;
  labelStyles?: SxProps;
  ariaLabel?: string;
  checkSelected?: boolean;
  typographyStyles?: SxProps;
  enableTextWrapping?: boolean;
  showSpinnerWhenNoData?: boolean;
  noOptionsText?: string;
}

const DropdownList: FC<Props> = ({
  componentStyle,
  label,
  placeholder,
  error,
  value,
  onChange,
  onClose,
  inputStyle,
  isDisabled = false,
  inputName,
  itemList,
  onInput,
  tooltip,
  toolTipWidth,
  isMultiValue,
  paperStyles,
  selectStyles,
  toolTipId,
  id,
  onAddNewClickBtn,
  addNewClickBtnText,
  required,
  emojiWithText,
  readOnly,
  errorFocusOutlineNeeded = true,
  labelStyles,
  checkSelected,
  ariaLabel,
  typographyStyles,
  enableTextWrapping = false,
  showSpinnerWhenNoData = true,
  noOptionsText
}: Props) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const handleChange = (
    event:
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ): void => {
    onChange?.(event);
    onInput?.(event);
  };

  return (
    <Box
      component="div"
      sx={{ ...classes.componentStyle, ...componentStyle } as SxProps}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={classes.labelContainerStyle}
      >
        <Typography
          component="label"
          lineHeight={1.5}
          sx={{ ...classes.labelStyle(isDisabled, !!error), ...labelStyles }}
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
        {tooltip && (
          <Tooltip
            title={tooltip}
            maxWidth={toolTipWidth}
            id={toolTipId}
            isDisabled={isDisabled}
            ariaDescription={tooltip as string}
          />
        )}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          ...classes.paperStyle(!!error, theme, errorFocusOutlineNeeded),
          ...inputStyle,
          ...paperStyles
        }}
      >
        {itemList?.length > 0 ? (
          <Select
            id={id}
            value={value?.toString() ?? ""}
            readOnly={readOnly}
            label={placeholder}
            onChange={handleChange}
            onKeyDown={(
              event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              if (shouldExpandDropdown(event.key)) {
                handleChange(event);
              }

              if (shouldCollapseDropdown(event.key)) {
                onClose?.(event);
              }
            }}
            onClose={onClose}
            name={inputName}
            disabled={isDisabled}
            multiple={isMultiValue}
            MenuProps={{
              style: {
                maxHeight: 300,
                zIndex: ZIndexEnums.MODAL,
                ...(enableTextWrapping ? { width: "max-content" } : {})
              }
            }}
            sx={{
              ...classes.selectStyle(theme, isDisabled, readOnly as boolean),
              ...selectStyles
            }}
            fullWidth
            inputProps={{
              "aria-label": ariaLabel || label,
              "aria-required": required
            }}
            displayEmpty={!!placeholder?.length}
            renderValue={
              value !== ""
                ? () => (
                    <Stack direction={"row"}>
                      {emojiWithText &&
                        getEmoji(
                          itemList?.find((item) => item?.value === value)
                            ?.emoji as string
                        )}
                      <Typography
                        sx={{
                          paddingLeft: emojiWithText ? "0.25rem" : "0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: readOnly ? "text.secondary" : "common.black"
                        }}
                      >
                        {itemList?.find((item) => item?.value === value)?.label}
                      </Typography>
                    </Stack>
                  )
                : () => (
                    <Typography
                      aria-hidden={true}
                      sx={classes.placeholderStyle}
                    >
                      {placeholder}
                    </Typography>
                  )
            }
          >
            {itemList?.map(({ label, value: menuItemValue, emoji }, index) => (
              <MenuItem
                key={index}
                value={menuItemValue}
                sx={{
                  ...classes.menuItemStyle,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.secondary.main
                  }
                }}
              >
                <Stack direction={"row"}>
                  {emojiWithText && getEmoji(emoji as string)}
                  <Typography
                    sx={{
                      paddingLeft: emojiWithText ? "0.25rem" : "0",
                      color:
                        value === menuItemValue
                          ? theme.palette.primary.dark
                          : theme.palette.text.primary,
                      ...typographyStyles
                    }}
                  >
                    {label}
                  </Typography>
                </Stack>
                {checkSelected && value === menuItemValue && (
                  <Icon
                    name={IconName.RIGHT_COLORED_ICON}
                    fill={theme.palette.primary.dark}
                  />
                )}
              </MenuItem>
            ))}
            {addNewClickBtnText && (
              <MenuItem
                onClick={onAddNewClickBtn}
                sx={classes.addNewClickBtnStyle}
              >
                <Icon
                  name={IconName.ADD_ICON}
                  fill={theme.palette.primary.dark}
                />
                <Typography sx={{ color: theme.palette.primary.dark }}>
                  {addNewClickBtnText}
                </Typography>
              </MenuItem>
            )}
          </Select>
        ) : (
          <Select
            id={id}
            value={value?.toString()}
            onChange={handleChange}
            onClose={onClose}
            onKeyDown={(
              event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              if (shouldExpandDropdown(event.key)) {
                handleChange(event);
              }

              if (shouldCollapseDropdown(event.key)) {
                onClose?.(event);
              }
            }}
            name={inputName}
            disabled={isDisabled}
            multiple={isMultiValue}
            sx={{
              flex: 1,
              "&& .MuiInputBase-input": {
                p: "0.7813rem 0.1875rem",
                zIndex: ZIndexEnums.DEFAULT
              }
            }}
            fullWidth
            inputProps={{
              "aria-label": ariaLabel || label,
              "aria-required": required
            }}
          >
            {showSpinnerWhenNoData ? (
              <Box display={"flex"} justifyContent={"center"}>
                <CircularProgress size={20} style={{ color: "black" }} />
              </Box>
            ) : (
              <Typography variant="body2" sx={{ p: 1 }}>
                {noOptionsText}
              </Typography>
            )}
          </Select>
        )}
      </Paper>

      {!!error && (
        <Typography
          role="alert"
          aria-live="assertive"
          variant="body2"
          sx={classes.errorTextStyle}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DropdownList;
