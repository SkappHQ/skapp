import {
  Box,
  ClickAwayListener,
  Stack,
  type SxProps,
  Typography
} from "@mui/material";
import { type FormikErrors } from "formik";
import React, {
  ChangeEvent,
  Dispatch,
  JSX,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { KeyboardKeys } from "~community/common/enums/KeyboardEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import { ManagerStoreType } from "~community/people/types/AddNewResourceTypes";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";
import { L4ManagerType } from "~community/people/types/PeopleTypes";

import AvatarChip from "../AvatarChip/AvatarChip";
import Search from "../Search/Search";

interface Props {
  isRequired?: boolean;
  id?: string;
  title: string;
  placeholder?: string;
  newResourceManager?: L4ManagerType;
  newResourceManagerList?: ManagerStoreType[];
  isManagerPopperOpen: boolean;
  managerSuggestions: EmployeeDataType[];
  managerSearchTerm: string;
  handleManagerRemove?: () => Promise<void>;

  handleManagerRemoveWithId?: (employeeId: string) => Promise<void>;
  handleManagerSelect: (user: EmployeeDataType) => Promise<void>;
  setIsManagerPopperOpen: Dispatch<SetStateAction<boolean>>;
  onManagerSearchChange: (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => Promise<void>;
  errors: FormikErrors<string>;
  isDisabled: boolean;
  isMultiSelect?: boolean;
  tooltip?: string;
  inputName: string;
  componentStyle?: SxProps;
  required?: boolean;
  needSearchIcon?: boolean;
  noSearchResultTexts?: string;
  isDisabledLabel?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const AvatarSearch = ({
  id,
  title,
  placeholder,
  newResourceManager,
  newResourceManagerList,
  isManagerPopperOpen,
  managerSuggestions,
  managerSearchTerm,
  handleManagerRemove,
  handleManagerRemoveWithId,
  handleManagerSelect,
  setIsManagerPopperOpen,
  onManagerSearchChange,
  errors,
  isDisabled,
  isMultiSelect = false,
  inputName,
  componentStyle,
  required,
  needSearchIcon = false,
  noSearchResultTexts,
  isDisabledLabel = false,
  onKeyDown
}: Props): JSX.Element => {
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "avatarSearch"
  );
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!isManagerPopperOpen) {
      setSelectedIndex(-1);
    }
  }, [isManagerPopperOpen]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [managerSuggestions]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isManagerPopperOpen || !managerSuggestions?.length) {
        if (onKeyDown) {
          onKeyDown(e);
        }
        return;
      }

      switch (e.key) {
        case KeyboardKeys.ARROW_DOWN:
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < managerSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case KeyboardKeys.ARROW_UP:
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : managerSuggestions.length - 1
          );
          break;
        case KeyboardKeys.ENTER:
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < managerSuggestions.length) {
            handleManagerSelect(managerSuggestions[selectedIndex]);
          }
          break;
        case KeyboardKeys.ESCAPE:
          e.preventDefault();
          setIsManagerPopperOpen(false);
          setSelectedIndex(-1);
          break;
        case KeyboardKeys.TAB:
          setIsManagerPopperOpen(false);
          setSelectedIndex(-1);
          break;
        default:
          if (onKeyDown) {
            onKeyDown(e);
          }
          break;
      }
    },
    [
      isManagerPopperOpen,
      managerSuggestions,
      selectedIndex,
      handleManagerSelect,
      setIsManagerPopperOpen,
      onKeyDown
    ]
  );
  const isPlaceholderAvailable = () => {
    return (
      Number(newResourceManager?.employeeId) > 0 ||
      (newResourceManagerList && newResourceManagerList?.length > 0)
    );
  };

  const getAriaLabel = () => {
    let baseLabel = title;

    if (!isMultiSelect && newResourceManager?.employeeId) {
      baseLabel += ` ${translateAria(["currentlySelected"])} ${newResourceManager.firstName} ${newResourceManager.lastName}`;
    }
    return baseLabel;
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          mt: "0.3rem",
          ...componentStyle
        }}
      >
        <Typography
          variant="placeholder"
          gutterBottom
          sx={{
            color:
              (errors ?? "")
                ? theme.palette.error.contrastText
                : isDisabledLabel
                  ? theme.palette.text.disabled
                  : "common.black"
          }}
        >
          {title} {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
      </Stack>
      <Box ref={parentRef} component={"div"}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          sx={{
            backgroundColor: theme.palette.grey[100],
            height: "3rem",
            borderRadius: "0.5rem"
          }}
          justifyContent={"flex-start"}
        >
          {Number(newResourceManager?.employeeId) > 0 && !isMultiSelect && (
            <AvatarChip
              key={newResourceManager?.employeeId}
              firstName={newResourceManager?.firstName ?? ""}
              lastName={newResourceManager?.lastName ?? ""}
              avatarUrl={newResourceManager?.authPic}
              isResponsiveLayout={false}
              isDeleteAvailable={false}
              chipStyles={{
                backgroundColor: "common.white",
                color: "common.black",
                height: "2.5rem",
                "& .MuiChip-deleteIcon": {
                  mr: "0.9375rem"
                },
                "& .MuiChip-label": {
                  pl: "0.5rem",
                  ml: "0.25rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden !important",
                  textOverflow: "ellipsis",
                  maxWidth: "11.25rem"
                },
                mt: "0rem",
                ml: "0.75rem"
              }}
              onDeleteChip={async () => {
                handleManagerRemove && (await handleManagerRemove());
              }}
              isDisabled={isDisabled}
            />
          )}
          {isMultiSelect &&
            newResourceManagerList?.map((manager: ManagerStoreType) => (
              <Box
                sx={{ height: "3.125rem", pt: "0.3125rem" }}
                key={manager?.employeeId}
              >
                <AvatarChip
                  firstName={manager?.firstName}
                  lastName={manager?.lastName}
                  avatarUrl={manager?.avatarUrl}
                  isResponsiveLayout={false}
                  isDeleteAvailable={true}
                  chipStyles={{
                    backgroundColor: "common.white",
                    color: "common.black",
                    height: "2.5rem",
                    "& .MuiChip-deleteIcon": {
                      mr: "0.9375rem"
                    },
                    "& .MuiChip-label": {
                      pl: "0.5rem",
                      ml: "0.25rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden !important",
                      textOverflow: "ellipsis",
                      maxWidth: "11.25rem"
                    },
                    mt: "0rem",
                    ml: "0.75rem"
                  }}
                  onDeleteChip={async () => {
                    handleManagerRemoveWithId &&
                      (await handleManagerRemoveWithId(
                        manager?.employeeId?.toString() ?? ""
                      ));
                  }}
                  isDisabled={isDisabled}
                />
              </Box>
            ))}
          <ClickAwayListener
            onClickAway={() => {
              setIsManagerPopperOpen(false);
            }}
          >
            <Search
              id={id ?? "avatar-search"}
              inputName={inputName}
              placeHolder={isPlaceholderAvailable() ? "" : placeholder}
              inputStyles={{
                "& input::placeholder": {
                  color: theme.palette.grey[600],
                  opacity: 1,
                  fontSize: "1rem",
                  fontWeight: 400
                }
              }}
              isPopperOpen={isManagerPopperOpen}
              setIsPopperOpen={setIsManagerPopperOpen}
              isAutoFocus={false}
              suggestions={managerSuggestions}
              componentStyles={{
                mt: "0rem",
                mb: 0,
                flex: "1"
              }}
              onSelectMember={(result) =>
                handleManagerSelect(result as EmployeeDataType)
              }
              onChange={onManagerSearchChange}
              value={newResourceManager?.employeeId ? "" : managerSearchTerm}
              error={errors ?? ""}
              changeLabelColorOnError={true}
              isDisabled={isDisabled}
              searchBoxStyles={{
                width: "100%"
              }}
              parentRef={parentRef}
              isErrorTextAvailable={false}
              needSearchIcon={needSearchIcon}
              noSearchResultTexts={noSearchResultTexts}
              noSearchResultTextStyles={{
                color: theme.palette.grey[700],
                fontSize: "1rem",
                fontWeight: 400
              }}
              popperStyles={{
                width: "100%"
              }}
              onKeyDown={handleKeyDown}
              ariaLabel={getAriaLabel()}
              selectedIndex={selectedIndex}
            />
          </ClickAwayListener>
        </Stack>
        {!!errors && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.error.contrastText,
              fontSize: "0.875rem",
              mt: "0.5rem",
              lineHeight: "1rem"
            }}
          >
            {errors}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AvatarSearch;
