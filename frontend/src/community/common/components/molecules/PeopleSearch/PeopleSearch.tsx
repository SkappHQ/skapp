import {
  Box,
  InputBase,
  Paper,
  Stack,
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
  useRef,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { numericPatternWithSpaces } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import {
  mergeSx,
  removeSpecialCharacters
} from "~community/common/utils/commonUtil";
import { EmployeeType } from "~community/people/types/EmployeeTypes";

import styles from "./styles";

interface Props {
  id?: string;
  isPopperOpen: boolean;
  placeHolder?: string;
  label?: string;
  value?: string;
  error?: string;
  isAutoFocus?: boolean;
  isFullWidth?: boolean;
  suggestions?: EmployeeType[];
  selectedUsers?: EmployeeType[];
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
  onSelectMember?: (user: EmployeeType) => void;
  setIsPopperOpen?: Dispatch<SetStateAction<boolean>>;
}

const PeopleSearch: FC<Props> = ({
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
  suggestionStyles,
  isDisabled,
  inputName,
  selectedUsers,
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
  onSelectMember,
  setIsPopperOpen
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const ref = useRef<HTMLHeadingElement | null>(null);

  const [isUserSelected, setIsUserSelected] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    if (value && !isDisabled && !isUserSelected) {
      if (value.length > 0) {
        setIsPopperOpen?.(true);
      } else {
        setIsPopperOpen?.(false);
      }
    } else {
      setIsPopperOpen?.(false);
    }
  }, [setIsPopperOpen, value, isDisabled, isUserSelected]);

  const handleSelectMember = (user: EmployeeType) => {
    if (onSelectMember) {
      setIsUserSelected(true);
      onSelectMember(user);
      setIsPopperOpen?.(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setIsUserSelected(false);
    if (onChange) {
      e.target.value = removeSpecialCharacters(e.target.value);
      if (
        numericPatternWithSpaces().test(e.target.value) ||
        e.target.value === ""
      ) {
        onChange(e);
      }
    }
  };

  const handleFocus = () => {
    if (onFocus) onFocus();
    setIsUserSelected(false);
  };

  return (
    <Stack sx={mergeSx([classes.wrapper, componentStyles])}>
      {label && (
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: (theme) =>
              error
                ? theme.palette.error.contrastText
                : isDisabled
                  ? theme.palette.text.disabled
                  : theme.palette.common.black,
            ...classes.label,
            ...labelStyles
          }}
        >
          {label} {required && <span style={classes.asterisk}>*</span>}
        </Typography>
      )}
      <Box ref={ref}>
        <Paper
          component="div"
          elevation={0}
          sx={{
            background: error
              ? theme.palette.error.light
              : theme.palette.grey[100],
            border: error
              ? `0.0625rem solid ${theme.palette.error.contrastText}`
              : "",
            ...classes.paper,
            ...searchBoxStyles
          }}
        >
          <InputBase
            id={id ?? "search-input"}
            sx={{
              ...classes.inputBase,
              ...inputStyles
            }}
            placeholder={placeHolder}
            fullWidth={isFullWidth}
            onChange={handleInputChange}
            value={value}
            disabled={isDisabled}
            autoFocus={isAutoFocus}
            onBlur={onBlur}
            onFocus={handleFocus}
            name={inputName}
          />
          {needSearchIcon && <Icon name={IconName.SEARCH_ICON} />}
        </Paper>
        {!!error && (
          <Typography
            role="alert"
            aria-live="assertive"
            variant="body2"
            sx={classes.error}
          >
            {error}
          </Typography>
        )}
      </Box>
      {(ref.current || parentRef) && !isDisabled && (
        <Popper
          open={isPopperOpen}
          anchorElWidth={width}
          anchorEl={parentRef ? parentRef.current : ref.current}
          position={"bottom-start"}
          menuType={MenuTypes.SEARCH}
          isManager={true}
          handleClose={() => setIsPopperOpen?.(false)}
          id={"suggestionPopper"}
          containerStyles={{ width: "inherit", ...popperStyles }}
        >
          <Box
            sx={mergeSx([
              classes.suggestionBox,
              {
                backgroundColor:
                  suggestions?.length === 0
                    ? theme.palette.common.white
                    : theme.palette.grey[100]
              },
              suggestionBoxStyles
            ])}
          >
            {suggestions?.length === 0 && !error && (
              <Box
                sx={{
                  ...classes.noSearchResultText,
                  ...noSearchResultTextStyles
                }}
              >
                {noSearchResultTexts}
              </Box>
            )}
            {suggestions &&
              suggestions?.map((user) => {
                const isSearchResultInFilterArray = selectedUsers?.some(
                  (filterArrayElement) =>
                    parseInt(filterArrayElement?.employeeId?.toString()) ===
                    parseInt(user?.employeeId?.toString())
                );
                if (isSearchResultInFilterArray) {
                  return null;
                } else {
                  return (
                    <Box
                      key={user.employeeId}
                      sx={mergeSx([classes.suggestion, suggestionStyles])}
                      onClick={() => handleSelectMember(user)}
                    >
                      <Box width="100%">
                        <AvatarChip
                          firstName={user?.firstName}
                          lastName={user?.lastName}
                          avatarUrl={user?.avatarUrl}
                          chipStyles={classes.chip}
                        />
                      </Box>
                    </Box>
                  );
                }
              })}
          </Box>
        </Popper>
      )}
    </Stack>
  );
};

export default PeopleSearch;
