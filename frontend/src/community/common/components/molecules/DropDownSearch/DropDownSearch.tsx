import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC, type ReactNode } from "react";
import Select, {
  type ActionMeta,
  type DropdownIndicatorProps,
  type MenuProps,
  components
} from "react-select";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { type DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { getLabelByValue } from "~community/common/utils/commonUtil";
import { handleMultipleSelectedValues } from "~community/common/utils/inputSelectHandler";

import { useGetSelectStyles } from "./styles";

interface Props {
  label?: string;
  inputName: string;
  inputStyle?: Record<string, string>;
  value: string | Array<string | number> | number;
  onChange?: (
    value: (string | number | Date)[] | string | number | Date
  ) => void;
  onInput?: () => void;
  onClose?: () => void;
  error?: string | string[];
  componentStyle?: Record<string, string>;
  isDisabled?: boolean;
  itemList: DropdownListType[];
  tooltip?: string;
  toolTipWidth?: string;
  placeholder?: string;
  isMultiValue?: boolean;
  addNewClickBtnText?: string;
  onAddNewClickBtn?: () => void;
  customStyles?: Record<string, string>;
  required?: boolean;
  labelId?: string;
}

const DropdownIndicator = (props: DropdownIndicatorProps): ReactNode => {
  return (
    <components.DropdownIndicator {...props}>
      <ArrowDropDownIcon />
    </components.DropdownIndicator>
  );
};

const DropdownSearch: FC<Props> = ({
  componentStyle,
  label,
  labelId,
  placeholder,
  error = "",
  value,
  onChange,
  isDisabled = false,
  inputName,
  itemList,
  tooltip,
  toolTipWidth,
  isMultiValue,
  addNewClickBtnText,
  onAddNewClickBtn,
  customStyles,
  required
}) => {
  const theme: Theme = useTheme();

  const selectStyles = useGetSelectStyles(error);

  const getValues = () => {
    if (isMultiValue && Array.isArray(value)) {
      return handleMultipleSelectedValues(value, itemList);
    } else if (!Array.isArray(value)) {
      return { label: getLabelByValue(itemList, value), value };
    }
    return null;
  };

  const Menu = (props: MenuProps): ReactNode => {
    return (
      <components.Menu {...props}>
        {props.children}
        {addNewClickBtnText && (
          <Box
            onClick={onAddNewClickBtn}
            sx={{
              display: "flex",
              flexDirection: "row",
              margin: "auto",
              gap: "0.5rem",
              zIndex: ZIndexEnums.DEFAULT,
              height: "3rem",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              cursor: "pointer"
            }}
          >
            <Typography
              sx={{
                color: theme.palette.primary.main
              }}
            >
              {addNewClickBtnText}
            </Typography>
            <Icon name={IconName.PLUS_ICON} fill={theme.palette.primary.main} />
          </Box>
        )}
      </components.Menu>
    );
  };

  const handleChange = (
    newValue: unknown,
    _actionMeta: ActionMeta<unknown>
  ): void => {
    const typedValue = newValue as DropdownListType | DropdownListType[];

    if (isMultiValue && Array.isArray(typedValue)) {
      const valueList = typedValue.map((item: DropdownListType) => item.value);
      onChange?.(valueList); // Use optional chaining in case onChange is not provided
    } else if (!Array.isArray(typedValue) && typedValue !== null) {
      onChange?.(typedValue.value); // Ensure it's not null and call onChange
    }
  };

  return (
    <Box
      component="div"
      sx={{
        mt: "0.75rem",
        ...componentStyle
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography
          component="label"
          id={labelId ?? "drop-down-search-label"}
          lineHeight={1.5}
          sx={{
            fontWeight: isDisabled ? 400 : 500,
            color: isDisabled
              ? theme.palette.grey[700]
              : error
                ? theme.palette.error.contrastText
                : "common.black",
            mb: "0.5rem"
          }}
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
        {tooltip && (
          <Tooltip
            title={tooltip}
            maxWidth={toolTipWidth}
            id="drop-down-search-tooltip"
          />
        )}
      </Stack>

      <Select
        aria-labelledby={labelId ?? "drop-down-search-label"}
        value={value ? getValues() : ""}
        placeholder={placeholder}
        options={itemList}
        styles={{
          menuList: (styles) => {
            return {
              ...styles,
              marginTop: 0,
              height: !getValues() ? "3.125rem" : "",
              maxHeight: "12.5rem",
              overflowY: "auto"
            };
          },
          menu: (styles) => {
            return {
              ...styles,
              border: customStyles?.border,
              borderRadius: customStyles?.borderRadius,
              marginLeft: customStyles?.marginLeft,
              marginTop: 0,
              height: !getValues() ? "6.25rem" : ""
            };
          },
          ...selectStyles
        }}
        menuPortalTarget={
          typeof window !== "undefined" ? document.body : undefined
        }
        components={{ DropdownIndicator, Menu }}
        onChange={handleChange}
        name={inputName}
        isDisabled={isDisabled}
        isMulti={isMultiValue}
      />

      {!!error && (
        <Typography
          variant="body2"
          role="alert"
          aria-live="assertive"
          sx={{
            color: theme.palette.error.contrastText,
            fontSize: "0.875rem",
            mt: "0.5rem",
            lineHeight: "1rem"
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DropdownSearch;
