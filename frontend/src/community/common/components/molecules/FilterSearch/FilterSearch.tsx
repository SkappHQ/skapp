import {
  Box,
  InputBase,
  Paper,
  type SxProps,
  Typography
} from "@mui/material/";
import { type Theme, useTheme } from "@mui/material/styles";
import {
  ChangeEvent,
  Dispatch,
  FC,
  RefObject,
  SetStateAction,
  useEffect,
  useRef
} from "react";

import {
  FilterButtonTypes,
  FilterSearchSuggestionsType
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { removeSpecialCharacters } from "~community/common/utils/commonUtil";
import { JobFilterRoles } from "~community/people/types/JobRolesTypes";

import Icon from "../../atoms/Icon/Icon";
import Popper from "../Popper/Popper";

interface Props {
  id?: string;
  isPopperOpen: boolean;
  placeHolder?: string;
  label?: string;
  value?: string;
  error?: string;
  isAutoFocus?: boolean;
  isFullWidth?: boolean;
  suggestions?: FilterButtonTypes[] | JobFilterRoles[];
  filterSearchResult?: boolean;
  selectedOptions?: FilterSearchSuggestionsType[];
  labelStyles?: SxProps;
  componentStyles?: SxProps;
  searchBoxStyles?: SxProps;
  suggestionBoxStyles?: SxProps;
  suggestionStyles?: SxProps;
  isDisabled?: boolean;
  inputName?: string;
  popperStyles?: Record<string, string>;
  noSearchResultTexts?: string;
  noSearchResultTextStyles?: SxProps;
  parentRef?: RefObject<HTMLDivElement | null>;
  inputStyles?: SxProps;
  required?: boolean;
  needSearchIcon?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSelectOption?: (value: FilterButtonTypes) => void;
  setIsPopperOpen?: Dispatch<SetStateAction<boolean>>;
}

const FilterSearch: FC<Props> = ({
  id,
  isPopperOpen,
  placeHolder,
  label,
  value,
  error,
  isFullWidth = true,
  isAutoFocus = false,
  suggestions,
  componentStyles,
  searchBoxStyles,
  labelStyles,
  suggestionBoxStyles,
  isDisabled,
  inputName,
  popperStyles,
  noSearchResultTexts,
  noSearchResultTextStyles,
  parentRef,
  inputStyles,
  required = false,
  needSearchIcon = true,
  onBlur,
  onFocus,
  onChange,
  onSelectOption,
  setIsPopperOpen
}) => {
  const theme: Theme = useTheme();
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (value) {
      if (value.length > 0) {
        setIsPopperOpen?.(true);
      } else {
        setIsPopperOpen?.(false);
      }
    } else {
      setIsPopperOpen?.(false);
    }
  }, [setIsPopperOpen, value]);

  return (
    <Box sx={{ my: "1.2rem", ...componentStyles }}>
      {label && (
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "500",
            fontSize: "1rem",
            color: (theme) =>
              error
                ? theme.palette.error.contrastText
                : isDisabled
                  ? theme.palette.text.disabled
                  : theme.palette.common.black,
            mb: "0.625rem",
            ...labelStyles
          }}
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
      )}
      <Box ref={ref}>
        <Box>
          <Paper
            component="div"
            elevation={0}
            sx={{
              p: "0.5rem 0.9375rem",
              display: "flex",
              alignItems: "center",
              background: error
                ? theme.palette.error.light
                : theme.palette.grey[100],
              borderRadius: "0.5rem",
              border: error
                ? `0.0625rem solid ${theme.palette.error.contrastText}`
                : "",
              ...searchBoxStyles
            }}
          >
            <InputBase
              id={id ?? "search-input"}
              sx={{
                flex: 1,
                "& input::placeholder": {
                  fontSize: "1rem"
                },
                ...inputStyles
              }}
              placeholder={placeHolder}
              fullWidth={isFullWidth}
              onChange={(
                e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
              ) => {
                e.target.value = removeSpecialCharacters(e.target.value);
                onChange?.(e);
              }}
              value={value}
              disabled={isDisabled}
              autoFocus={isAutoFocus}
              onBlur={onBlur}
              onFocus={onFocus}
              name={inputName}
            />
            {needSearchIcon && <Icon name={IconName.SEARCH_ICON} />}
          </Paper>
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
      </Box>
      {(ref.current || parentRef) && (
        <Popper
          open={isPopperOpen}
          anchorEl={parentRef ? parentRef.current : ref.current}
          position={"bottom-start"}
          menuType={MenuTypes.SEARCH}
          isManager={true}
          handleClose={() => {}}
          id={"suggestionPopper"}
          containerStyles={popperStyles}
        >
          <Box
            sx={{
              backgroundColor:
                suggestions?.length === 0
                  ? theme.palette.common.white
                  : theme.palette.grey[100],
              borderRadius: "0.75rem",
              maxHeight: "11.25rem",
              overflowY: "auto",
              overflowX: "hidden",
              width: "100%",
              ...suggestionBoxStyles
            }}
          >
            {suggestions?.length === 0 && !error && (
              <Box
                sx={{
                  p: "1.25rem",
                  ...noSearchResultTextStyles
                }}
              >
                {noSearchResultTexts}
              </Box>
            )}
            {suggestions?.map((suggestion, index) => {
              return (
                <Box
                  key={index}
                  sx={{
                    flex: "display",
                    alignItems: "center",
                    height: "48px",
                    weight: "328px",
                    padding: "8px 12px 8px 15px",
                    gap: "4px",
                    "&:hover": {
                      cursor: "pointer"
                    }
                  }}
                  onClick={
                    onSelectOption
                      ? () => onSelectOption(suggestion)
                      : undefined
                  }
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "16px"
                    }}
                  >
                    {suggestion.text}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Popper>
      )}
    </Box>
  );
};

export default FilterSearch;
