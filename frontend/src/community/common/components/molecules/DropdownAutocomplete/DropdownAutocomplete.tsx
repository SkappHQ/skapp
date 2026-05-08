import {
  Autocomplete,
  Box,
  CircularProgress,
  InputBase,
  Paper,
  Popper,
  Stack,
  Typography
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { type SxProps } from "@mui/system";
import React, { FC, SyntheticEvent, useCallback } from "react";

import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";

import Icon from "../../atoms/Icon/Icon";

interface DropDownType {
  label: string;
  value: string;
}

interface Props {
  inputName: string;
  itemList: DropDownType[];
  label?: string;
  placeholder?: string;
  inputStyle?: Record<string, string>;
  value?: DropDownType;
  onChange?: (
    e: SyntheticEvent,
    value: DropDownType | DropdownListType
  ) => void | Promise<void>;
  onInput?: () => void;
  onClose?: () => void;
  error?: string | string[];
  componentStyle?: Record<string, string>;
  isDisabled?: boolean;
  readOnly?: boolean;
  tooltip?: string;
  toolTipWidth?: string;
  selectStyles?: SxProps;
  labelStyles?: SxProps;
  popperPosition?:
    | "auto-end"
    | "auto-start"
    | "auto"
    | "bottom-end"
    | "bottom-start"
    | "bottom"
    | "left-end"
    | "left-start"
    | "left"
    | "right-end"
    | "right-start"
    | "right"
    | "top-end"
    | "top-start"
    | "top";
  isDisableOptionFilter?: boolean;
  required?: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const DropdownAutocomplete: FC<Props> = ({
  componentStyle,
  label,
  error = "",
  value,
  placeholder,
  onChange,
  isDisabled = false,
  readOnly,
  inputName,
  itemList,
  tooltip,
  toolTipWidth,
  selectStyles,
  popperPosition,
  isDisableOptionFilter = false,
  required,
  labelStyles,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}) => {
  const theme: Theme = useTheme();

  const handleListboxScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      const listbox = event.currentTarget;
      console.log("scroll:", {
        scrollTop: listbox.scrollTop,
        clientHeight: listbox.clientHeight,
        scrollHeight: listbox.scrollHeight,
        hasNextPage,
        isFetchingNextPage
      });
      if (!hasNextPage || isFetchingNextPage) return;

      if (
        listbox.scrollTop + listbox.clientHeight >=
        listbox.scrollHeight - 10
      ) {
        fetchNextPage?.();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return (
    <Box
      component="div"
      sx={{
        mt: ".75rem",
        ...componentStyle
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="placeholder"
          sx={{
            color: isDisabled
              ? theme.palette.text.disabled
              : error
                ? theme.palette.error.contrastText
                : "black",
            mb: ".5rem",
            ...labelStyles
          }}
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
        {tooltip && <Tooltip title={tooltip} maxWidth={toolTipWidth} />}
      </Stack>

      <Autocomplete
        disablePortal
        id={inputName}
        options={itemList}
        getOptionLabel={(option) => option.label ?? ""}
        sx={{
          width: "100%",
          backgroundColor: isDisabled
            ? theme.palette.grey[100]
            : error
              ? theme.palette.error.light
              : theme.palette.grey[100],
          outline: "none",
          border: error
            ? `${theme.palette.error.contrastText} .0625rem solid`
            : "none",
          boxShadow: "none",
          borderRadius: ".5rem",
          height: "3rem",
          padding: "0rem",
          ":hover": {
            border: error
              ? `${theme.palette.error.contrastText} .0625rem solid`
              : "none"
          },
          "& .MuiAutocomplete-popupIndicator": {
            mr: ".3125rem",
            display: readOnly ? "none" : "block"
          },
          "&.Mui-focused, &:focus-visible": {
            outline: `0.125rem solid ${theme.palette.common.black}`,
            outlineOffset: "-0.125rem"
          },
          ...selectStyles
        }}
        renderInput={(params) => {
          const { InputProps, ...rest } = params;

          return (
            <InputBase
              placeholder={placeholder}
              readOnly={readOnly}
              {...InputProps}
              {...rest}
              sx={{
                "&& .MuiInputBase-input": {
                  p: ".75rem 1rem",
                  "&.Mui-disabled": {
                    WebkitTextFillColor: theme.palette.grey[700]
                  },
                  color: theme.palette.text.secondary,
                  fontSize: "1rem",
                  fontWeight: 400
                }
              }}
            />
          );
        }}
        renderOption={(props, option) => (
          <li
            {...props}
            style={{
              justifyContent: "space-between"
            }}
          >
            <Box
              sx={{
                maxWidth: "90%"
              }}
            >
              <Typography>{option.label}</Typography>
            </Box>
            <Box>
              {value && option.value === value.value && (
                <Icon
                  name={IconName.RIGHT_COLORED_ICON}
                  fill={theme.palette.primary.dark}
                />
              )}
            </Box>
          </li>
        )}
        disableClearable={true}
        PopperComponent={(props) => (
          <Popper {...props} placement={popperPosition} />
        )}
        PaperComponent={(props) => (
          <Paper
            elevation={8}
            {...props}
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "1rem",
              fontWeight: 400,
              fontStyle: "normal",
              boxShadow: "none",
              border: `.0625rem solid ${theme.palette.grey[300]}`
            }}
          />
        )}
        filterOptions={
          isDisableOptionFilter
            ? (options) => options
            : (options, state) =>
                options.filter((option) =>
                  option.label
                    .toLowerCase()
                    .startsWith(state.inputValue.trimStart().toLowerCase())
                )
        }
        slotProps={{
          listbox: {
            onScroll: handleListboxScroll,
            style: { maxHeight: 150, overflow: "auto" }
          }
        }}
        loading={isFetchingNextPage}
        loadingText={
          <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
            <CircularProgress size={20} />
          </Box>
        }
        disabled={readOnly || isDisabled}
        onChange={onChange}
        value={value ?? null}
        isOptionEqualToValue={(option, val) => option.value === val.value}
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

export default DropdownAutocomplete;
