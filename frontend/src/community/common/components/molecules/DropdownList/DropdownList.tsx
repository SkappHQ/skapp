import {
  CircularProgress,
  MenuItem,
  MenuListProps,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Theme, useTheme } from "@mui/material/styles";
import { Box, SxProps } from "@mui/system";
import {
  FC,
  HTMLAttributes,
  InputHTMLAttributes,
  JSX,
  KeyboardEvent,
  SyntheticEvent,
  useId
} from "react";

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

const getMenuContainer = (): HTMLElement | null =>
  typeof document === "undefined" ? null : document.querySelector("main");

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
  readOnly = false,
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

  const accessibleName = ariaLabel || label || placeholder;

  const reactId = useId();
  const idSeed = `${id ?? inputName}-${reactId}`;

  const labelId = label && !ariaLabel ? `${idSeed}-label` : undefined;

  const errorId = error ? `${idSeed}-error` : undefined;

  const menuListProps: Partial<MenuListProps> = {
    "aria-label": accessibleName
  };

  // Shared by both Select branches: keep them hoisted so ARIA wiring cannot drift apart.
  const selectInputProps: InputHTMLAttributes<HTMLInputElement> = {
    "aria-label": accessibleName,
    "aria-describedby": errorId
  };

  const selectDisplayProps: HTMLAttributes<HTMLDivElement> = {
    "aria-labelledby": labelId,
    "aria-invalid": !!error,
    "aria-required": required ? "true" : undefined
  };

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
          id={labelId}
          lineHeight={1.5}
          sx={{ ...classes.labelStyle(isDisabled, !!error), ...labelStyles }}
        >
          {label}{" "}
          {required && (
            <Box
              component="span"
              aria-hidden="true"
              sx={classes.requiredAsteriskStyle}
            >
              *
            </Box>
          )}
        </Typography>
        {tooltip && (
          <Tooltip
            title={tooltip}
            maxWidth={toolTipWidth}
            id={toolTipId}
            isDisabled={isDisabled}
            ariaDescription={typeof tooltip === "string" ? tooltip : undefined}
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
            value={value?.toString()}
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
              container: getMenuContainer,
              style: {
                maxHeight: 300,
                zIndex: ZIndexEnums.NEWMODAL,
                ...(enableTextWrapping ? { width: "max-content" } : {})
              },
              MenuListProps: menuListProps
            }}
            sx={{
              ...classes.selectStyle(theme, isDisabled, readOnly),
              ...selectStyles
            }}
            fullWidth
            inputProps={selectInputProps}
            SelectDisplayProps={selectDisplayProps}
            displayEmpty={!!placeholder?.length}
            renderValue={(selected) =>
              selected === undefined || selected === "" ? (
                <Typography aria-hidden={true} sx={classes.placeholderStyle}>
                  {placeholder}
                </Typography>
              ) : (
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
            MenuProps={{
              container: getMenuContainer,
              MenuListProps: {
                ...menuListProps,
                "aria-busy": showSpinnerWhenNoData
              }
            }}
            sx={{
              flex: 1,
              "&& .MuiInputBase-input": {
                p: "0.7813rem 0.1875rem",
                zIndex: ZIndexEnums.DEFAULT
              }
            }}
            fullWidth
            inputProps={selectInputProps}
            SelectDisplayProps={selectDisplayProps}
          >
            {showSpinnerWhenNoData ? (
              <MenuItem
                disabled
                value=""
                sx={{
                  justifyContent: "center",
                  "&.Mui-disabled": { opacity: 1 }
                }}
              >
                <CircularProgress
                  size={20}
                  aria-hidden="true"
                  sx={classes.spinnerStyle}
                />
              </MenuItem>
            ) : (
              <MenuItem
                disabled
                value=""
                sx={{ "&.Mui-disabled": { opacity: 1 } }}
              >
                <Typography variant="body2">{noOptionsText}</Typography>
              </MenuItem>
            )}
          </Select>
        )}
      </Paper>

      {!!error && (
        <Typography
          id={errorId}
          role="status"
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
