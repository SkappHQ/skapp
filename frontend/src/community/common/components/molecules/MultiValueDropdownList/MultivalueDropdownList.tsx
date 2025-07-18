import {
  Chip,
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
import { FC, JSX, SyntheticEvent, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";

import { styles } from "./styles";

interface Props {
  label?: string;
  placeholder?: string;
  inputName: string;
  inputStyle?: SxProps;
  value: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  onInput?: (value: (string | number)[]) => void;
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
  isRequired?: boolean;
  isEmojiWithText?: boolean;
  isReadOnly?: boolean;
  isErrorFocusOutlineNeeded?: boolean;
  labelStyles?: SxProps;
  isCheckSelected?: boolean;
  ariaLabel?: string;
}

// TODO: fix name
const MultivalueDropdownList: FC<Props> = ({
  label,
  placeholder,
  inputName,
  value = [],
  onChange,
  onClose,
  error,
  componentStyle,
  inputStyle,
  isDisabled = false,
  itemList,
  onInput,
  tooltip,
  toolTipWidth,
  paperStyles,
  selectStyles,
  toolTipId,
  id,
  onAddNewClickBtn,
  addNewClickBtnText,
  isRequired: required,
  isEmojiWithText: emojiWithText,
  isReadOnly: readOnly = false,
  isErrorFocusOutlineNeeded: errorFocusOutlineNeeded = true,
  labelStyles,
  isCheckSelected: checkSelected,
  ariaLabel
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);
  const [open, setOpen] = useState(false);

  // TODO: move to separate file and write unit test cases for this
  const handleChange = (event: SelectChangeEvent<(string | number)[]>) => {
    const selectedValues = event.target.value as unknown as (string | number)[];
    onChange?.(selectedValues.filter((value) => value !== undefined));
    onInput?.(selectedValues.filter((value) => value !== undefined));
  };

  const handleAddNewClick = () => {
    setOpen(false);
    onAddNewClickBtn?.();
  };

  // TODO: create a separate component for this
  const renderSelectedValues = (selectedValues: (string | number)[]) => {
    if (selectedValues.length === 0) return placeholder || "";
    const sortedSelected = [...selectedValues].sort();
    const firstSelectedLabel = itemList.find(
      (item) => item.value === sortedSelected[0]
    )?.label;

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        <Chip label={firstSelectedLabel || sortedSelected[0]} />
        {selectedValues.length > 1 && (
          <Chip label={`+${selectedValues.length - 1}`} />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ ...classes.componentStyle, ...componentStyle } as SxProps}>
      {label && (
        // TODO: move styles to styles.ts
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={classes.labelContainerStyle}
        >
          <Typography
            component="label"
            sx={{ ...classes.labelStyle(isDisabled, !!error), ...labelStyles }}
          >
            {label}
            &nbsp;
            {required && (
              // TODO: move styles to styles.ts
              <Typography
                component="span"
                style={{ color: theme.palette.error.light }}
              >
                *
              </Typography>
            )}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} maxWidth={toolTipWidth} id={toolTipId} />
          )}
        </Stack>
      )}

      <Paper
        elevation={0}
        sx={{
          ...classes.paperStyle(!!error, theme, errorFocusOutlineNeeded),
          ...inputStyle,
          ...paperStyles
        }}
      >
        {itemList.length > 0 ? (
          // TODO: create a separate component for this
          <Select
            id={id}
            multiple
            value={value ?? []}
            readOnly={readOnly}
            onChange={handleChange}
            onClose={(e) => {
              setOpen(false);
              onClose?.(e);
            }}
            onOpen={() => setOpen(true)}
            open={open}
            name={inputName}
            disabled={isDisabled}
            MenuProps={{
              style: { maxHeight: 300, zIndex: ZIndexEnums.DEFAULT }
            }}
            sx={{
              ...classes.selectStyle(theme, isDisabled, readOnly),
              ...selectStyles
            }}
            fullWidth
            displayEmpty={!!placeholder}
            renderValue={renderSelectedValues}
            inputProps={{
              "aria-label": ariaLabel || label
            }}
          >
            {itemList.map(({ label, value: menuItemValue, emoji }, index) => (
              <MenuItem
                key={index}
                value={menuItemValue}
                // TODO: move styles to styles.ts
                sx={{
                  ...classes.menuItemStyle,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.secondary.main
                  },
                  marginBottom: 0.1
                }}
              >
                <Stack direction={"row"}>
                  {emojiWithText && emoji && getEmoji(emoji)}
                  <Typography
                    // TODO: move styles to styles.ts
                    sx={{ paddingLeft: emojiWithText ? "0.25rem" : "0" }}
                  >
                    {label}
                  </Typography>
                </Stack>
                {checkSelected && value.includes(menuItemValue) && (
                  <Icon
                    name={IconName.RIGHT_COLORED_ICON}
                    fill={theme.palette.primary.dark}
                  />
                )}
              </MenuItem>
            ))}
            {addNewClickBtnText && (
              <MenuItem
                onClick={handleAddNewClick}
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
          // TODO: move styles to styles.ts
          <Box display="flex" justifyContent="center">
            <CircularProgress size={20} style={{ color: "black" }} />
          </Box>
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

export default MultivalueDropdownList;
