import {
  Box,
  InputBase,
  Avatar as MUIAvatar,
  Paper,
  Stack,
  type SxProps,
  Typography
} from "@mui/material/";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { type Theme, useTheme } from "@mui/material/styles";
import React, {
  ChangeEvent,
  Dispatch,
  FC,
  ReactNode,
  RefObject,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useRef,
  useState
} from "react";

import AnalyticsTeamIcon from "~community/common/assets/Icons/AnalyticsTeamIcon";
import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import Button from "~community/common/components/atoms/Button/Button";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  EmployeeSearchResultType,
  EmployeeTeamSearchResultType,
  TeamSearchResultType
} from "~community/common/types/CommonTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { removeSpecialCharacters } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";
import {
  EmployeeDataType,
  EmployeeDetails,
  EmployeeSuggestions
} from "~community/people/types/EmployeeTypes";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

interface Props {
  id?: string;
  isPopperOpen: boolean;
  setIsPopperOpen?: Dispatch<SetStateAction<boolean>>;
  placeHolder?: string;
  label?: string;
  value?: string;
  error?: string;
  isAutoFocus?: boolean;
  isFullWidth?: boolean;
  suggestions?: EmployeeDetails[] | EmployeeDataType[] | EmployeeSuggestions[];
  onBlur?: () => void;
  onFocus?: () => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSelectMember?: (
    user: EmployeeDataType | TeamSearchResultType | EmployeeSearchResultType
  ) => void;
  isInviteMember?: boolean;
  inviteClickHandler?: () => void;
  filterSearchResult?: boolean;
  searchResultFilterArray?: EmployeeDataType[];
  isCompanyEmail?: boolean;
  labelStyles?: SxProps;
  componentStyles?: SxProps;
  searchBoxStyles?: SxProps;
  suggestionBoxStyles?: SxProps;
  suggestionStyles?: SxProps;
  isDisabled?: boolean;
  inputName?: string;
  changeLabelColorOnError?: boolean;
  defaultPopperClose?: boolean;
  isEmployeeAndUserSearch?: boolean;
  employeeAndUserSearchResult?: EmployeeTeamSearchResultType;
  popperStyles?: Record<string, string>;
  noSearchResultTexts?: string;
  noSearchResultTextStyles?: SxProps;
  parentRef?: RefObject<HTMLDivElement | null>;
  isErrorTextAvailable?: boolean;
  inputStyles?: SxProps;
  isManagerSearch?: boolean;
  managerSearchButtonHandler?: (term: string) => void;
  onSelectTabValue?: (searchTab: string) => void;
  required?: boolean;
  needSearchIcon?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
  selectedIndex?: number;
}

const Search: FC<Props> = ({
  id,
  isPopperOpen,
  setIsPopperOpen,
  placeHolder,
  label,
  value,
  error,
  isFullWidth = true,
  isAutoFocus = false,
  suggestions,
  onBlur,
  onFocus,
  onChange,
  onSelectMember,
  isInviteMember = false,
  inviteClickHandler,
  isCompanyEmail = true,
  componentStyles,
  searchBoxStyles,
  labelStyles,
  suggestionBoxStyles,
  suggestionStyles,
  isDisabled,
  inputName,
  changeLabelColorOnError = false,
  defaultPopperClose = false,
  isEmployeeAndUserSearch = false,
  employeeAndUserSearchResult,
  popperStyles,
  noSearchResultTexts,
  noSearchResultTextStyles,
  parentRef,
  isErrorTextAvailable = true,
  inputStyles,
  isManagerSearch = false,
  onSelectTabValue,
  required = false,
  needSearchIcon = true,
  onKeyDown,
  ariaLabel,
  selectedIndex = -1
}) => {
  const translateAria = useTranslator("commonAria", "components", "search");
  const theme: Theme = useTheme();
  const ref = useRef<HTMLHeadingElement | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTab, setSelectedTab] = useState("Individual");

  useEffect(() => {
    if (selectedIndex >= 0) {
      const selectedElement = document.getElementById(
        `suggestion-${selectedIndex}`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    }
  }, [selectedIndex]);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedTab(newValue === 1 ? "Team" : "Individual");
  };

  const searchButtonHandler = (option: string) => {
    setSelectedTab(option);
    onSelectTabValue && onSelectTabValue(option);
    setTabValue(option === "Team" ? 1 : 0);
  };

  const CustomTabPanel = ({ children, value, index }: TabPanelProps) => {
    return (
      <div role="tabpanel" hidden={value !== index}>
        {value === index && (
          <Box>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (value && !defaultPopperClose) {
      if (value.length > 0) {
        setIsPopperOpen && setIsPopperOpen(true);
      } else {
        setIsPopperOpen && setIsPopperOpen(false);
      }
    } else {
      setIsPopperOpen && setIsPopperOpen(false);
    }
  }, [defaultPopperClose, setIsPopperOpen, value]);

  return (
    <Box sx={{ my: "1.2rem", ...componentStyles }}>
      {isManagerSearch && (
        <Stack
          sx={{
            bgcolor: "#FAFAFA",
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            borderRadius: "0.5rem",
            paddingBottom: isManagerSearch ? "1.25rem" : ""
          }}
        >
          <Button
            buttonStyle={
              selectedTab === "Individual"
                ? ButtonStyle.SECONDARY
                : ButtonStyle.TERTIARY
            }
            label={"Individual"}
            isFullWidth={false}
            styles={{
              px: "2.125rem",
              py: "0.625rem",
              fontSize: "1rem",
              fontWeight: 400
            }}
            onClick={() => searchButtonHandler("Individual")}
          />
          <Button
            buttonStyle={
              selectedTab === "Team"
                ? ButtonStyle.SECONDARY
                : ButtonStyle.TERTIARY
            }
            label={"Team"}
            isFullWidth={false}
            styles={{
              px: "2.125rem",
              py: "0.625rem",
              fontSize: "1rem",
              fontWeight: 400,
              marginLeft: "1.125rem"
            }}
            onClick={() => searchButtonHandler("Team")}
          />
        </Stack>
      )}
      {label && (
        <Typography
          id="search-label"
          component="label"
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "500",
            fontSize: "1rem",
            color: (theme) =>
              error && changeLabelColorOnError
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
                onChange && onChange(e);
              }}
              value={value}
              disabled={isDisabled}
              autoFocus={isAutoFocus}
              onBlur={onBlur}
              onFocus={onFocus}
              name={inputName}
              onKeyDown={onKeyDown}
              inputProps={{
                "aria-label": ariaLabel ?? translateAria(["label"]),
                "aria-expanded": isPopperOpen,
                "aria-haspopup": "listbox",
                "aria-autocomplete": "list",
                role: "combobox",
                "aria-activedescendant":
                  selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
              }}
            />
            {needSearchIcon && <SearchIcon />}
          </Paper>
          {!!error && isErrorTextAvailable && (
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
          ariaLabelledBy="search-label"
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
            role="listbox"
            aria-label={translateAria(["searchSuggestions"])}
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
            {!isEmployeeAndUserSearch &&
              suggestions &&
              (suggestions as EmployeeDataType[])?.map((user, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Box
                    key={user.employeeId}
                    id={`suggestion-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      py: "0.5rem",
                      backgroundColor: isSelected
                        ? theme.palette.action.hover
                        : "transparent",
                      "&:hover": {
                        cursor: "pointer",
                        borderRadius: "0.75rem",
                        backgroundColor: theme.palette.action.hover
                      },
                      "&:focus": {
                        outline: `0.125rem solid ${theme.palette.primary.main}`,
                        outlineOffset: "-0.125rem",
                        borderRadius: "0.75rem"
                      },
                      ...suggestionStyles
                    }}
                    onClick={
                      onSelectMember ? () => onSelectMember(user) : undefined
                    }
                    onKeyDown={(e) => {
                      if (shouldActivateButton(e.key)) {
                        e.preventDefault();
                        onSelectMember && onSelectMember(user);
                      }
                    }}
                  >
                    <Box width="100%">
                      <AvatarChip
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        avatarUrl={user?.avatarUrl}
                        chipStyles={{
                          cursor: "pointer",
                          maxWidth: "fit-content"
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            {isEmployeeAndUserSearch && (
              <Box sx={{ width: "100%" }}>
                {!isManagerSearch && (
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleChange}
                      indicatorColor="primary"
                    >
                      <Tab
                        label="Individual"
                        sx={{
                          textTransform: "none",
                          borderBottom: selectedTab === "Individual" ? 2 : 0,
                          borderColor: "black",
                          flexDirection: "row",
                          fontFamily: "Poppins",
                          fontWeight: 700,
                          fontSize: "1rem",
                          color:
                            selectedTab === "Individual"
                              ? "common.black"
                              : "grey.700"
                        }}
                      />
                      <Tab
                        label="Team"
                        sx={{
                          textTransform: "none",
                          borderBottom: selectedTab === "Team" ? 2 : 0,
                          borderColor: "black",
                          fontFamily: "Poppins",
                          fontWeight: 700,
                          fontSize: "1rem",
                          color:
                            selectedTab === "Team" ? "common.black" : "grey.700"
                        }}
                      />
                    </Tabs>
                  </Box>
                )}
                <CustomTabPanel value={tabValue} index={0}>
                  {employeeAndUserSearchResult?.employeeResponseDtoList
                    ?.length === 0 && (
                    <Box
                      sx={{
                        p: "0.75rem"
                      }}
                    >
                      {noSearchResultTexts}
                    </Box>
                  )}
                  {employeeAndUserSearchResult?.employeeResponseDtoList?.map(
                    (user) => {
                      return (
                        <Box
                          key={user.employeeId}
                          sx={{
                            p: "0.75rem",
                            "&:hover": {
                              cursor: "pointer",
                              borderRadius: "0.75rem",
                              backgroundColor: theme.palette.grey[300]
                            },
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center"
                          }}
                          onClick={
                            onSelectMember
                              ? () => onSelectMember(user)
                              : undefined
                          }
                        >
                          <Avatar
                            firstName={user?.firstName}
                            lastName={user?.lastName}
                            sx={{ marginRight: "1.25rem" }}
                            src={user?.authPic}
                          />
                          <Typography
                            sx={{
                              marginLeft: "1.25rem"
                            }}
                          >
                            {user?.firstName} {user?.lastName}
                          </Typography>
                        </Box>
                      );
                    }
                  )}
                </CustomTabPanel>
                <CustomTabPanel value={tabValue} index={1}>
                  {employeeAndUserSearchResult?.teamResponseDtoList?.length ===
                    0 && (
                    <Box
                      sx={{
                        p: "0.75rem"
                      }}
                    >
                      {noSearchResultTexts}
                    </Box>
                  )}
                  {employeeAndUserSearchResult?.teamResponseDtoList?.map(
                    (team) => {
                      return (
                        <Box
                          key={team.teamId}
                          sx={{
                            p: "0.75rem",
                            "&:hover": {
                              cursor: "pointer",
                              borderRadius: "0.75rem",
                              backgroundColor: theme.palette.grey[300]
                            },
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center"
                          }}
                          onClick={
                            onSelectMember
                              ? () => onSelectMember(team)
                              : undefined
                          }
                        >
                          <MUIAvatar
                            sx={{
                              marginRight: "1.25rem",
                              backgroundColor: "white"
                            }}
                          >
                            <AnalyticsTeamIcon
                              fill={theme.palette.grey[700]}
                              backgroundFill={theme.palette.grey[100]}
                            />
                          </MUIAvatar>
                          {team.teamName}
                        </Box>
                      );
                    }
                  )}
                </CustomTabPanel>
              </Box>
            )}
            {isInviteMember && isCompanyEmail && (
              <Button
                label={"Invite to myLeave and add"}
                endIcon={<PlusIcon />}
                styles={{
                  backgroundColor: "common.white",
                  margin: "0.75rem",
                  fontSize: "0.9375rem",
                  lineHeight: "1.5625rem",
                  width: "96%",
                  height: "2.5rem",
                  fontWeight: 400,
                  "&:hover": {
                    backgroundColor: "common.white",
                    boxShadow: "none"
                  }
                }}
                onClick={inviteClickHandler}
              />
            )}
          </Box>
        </Popper>
      )}
    </Box>
  );
};

export default Search;
