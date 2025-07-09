import { CircularProgress, Stack } from "@mui/material";
import { Box, type Theme, useTheme } from "@mui/system";
import {
  ChangeEvent,
  Dispatch,
  JSX,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Checkbox from "~community/common/components/atoms/Checkbox/Checkbox";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { KeyboardKeys } from "~community/common/enums/KeyboardEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { shouldNavigateForward } from "~community/common/utils/keyboardUtils";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";
import { L4ManagerType } from "~community/people/types/PeopleTypes";

interface Props {
  selectedManagers: L4ManagerType[];
  setSelectedManagers: Dispatch<SetStateAction<L4ManagerType[]>>;
  managerSuggestions: EmployeeDataType[];
  hasAllSelector?: boolean;
  onManagerSearchChange: (
    e?: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    searchTerm?: string
  ) => Promise<void>;
  managerSearchTerm: string;
  isSearchResultsLoading?: boolean;
  filterOpen?: boolean;
  setFilterOpen?: Dispatch<SetStateAction<boolean>>;
}

const MultiSelectManagerSearch = ({
  selectedManagers,
  setSelectedManagers,
  managerSuggestions,
  onManagerSearchChange,
  managerSearchTerm,
  isSearchResultsLoading,
  filterOpen,
  setFilterOpen
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const translateAria = useTranslator(
    "commonAria",
    "components",
    "multiSelectManagerSearch"
  );

  const { employee: currentEmployee, setEmploymentDetails } = usePeopleStore(
    (state) => state
  );

  const displayItems = useMemo(() => {
    if (managerSearchTerm?.trim() === "") {
      return selectedManagers.map((manager) => ({
        employeeId: manager.employeeId,
        firstName: manager.firstName,
        lastName: manager.lastName,
        authPic: manager.authPic
      }));
    } else {
      return (managerSuggestions || []).filter(
        (suggestion) =>
          !selectedManagers.some(
            (manager) => manager.employeeId === suggestion.employeeId
          )
      );
    }
  }, [managerSearchTerm, selectedManagers, managerSuggestions]);

  useEffect(() => {
    setFocusedIndex(-1);
    itemRefs.current = new Array(displayItems.length).fill(null);
  }, [managerSearchTerm, displayItems.length]);

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [focusedIndex]);

  useEffect(() => {
    if (managerSearchTerm?.trim() !== "") {
      setIsExpanded(displayItems.length > 0);
    } else if (managerSearchTerm?.trim() === "" && displayItems.length === 0) {
      setIsExpanded(false);
    }
  }, [displayItems.length, managerSearchTerm]);

  const toggleManagerSelection = (
    employee: EmployeeDataType | L4ManagerType
  ) => {
    const isSelected = selectedManagers.some(
      (manager) => manager.employeeId === Number(employee.employeeId)
    );

    const newSelectedManagers = isSelected
      ? selectedManagers.filter(
          (manager) => manager.employeeId !== Number(employee.employeeId)
        )
      : [
          ...selectedManagers,
          {
            employeeId: Number(employee.employeeId),
            firstName: employee.firstName,
            lastName: employee.lastName,
            authPic: employee.authPic
          }
        ];

    setSelectedManagers(newSelectedManagers);
    setEmploymentDetails({
      employmentDetails: {
        ...currentEmployee.employment?.employmentDetails,
        otherSupervisors: newSelectedManagers
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const { key } = event;

    switch (key) {
      case KeyboardKeys.ARROW_DOWN:
        event.preventDefault();
        setIsExpanded(true);
        setFocusedIndex((prev) =>
          prev < displayItems.length - 1 ? prev + 1 : 0
        );
        break;

      case KeyboardKeys.ARROW_UP:
        event.preventDefault();
        setIsExpanded(true);
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : displayItems.length - 1
        );
        break;

      case KeyboardKeys.ENTER:
      case KeyboardKeys.SPACE:
        event.preventDefault();
        if (focusedIndex >= 0 && displayItems[focusedIndex]) {
          toggleManagerSelection(displayItems[focusedIndex]);
        }
        break;

      case KeyboardKeys.ESCAPE:
        event.preventDefault();
        setIsExpanded(false);
        setFocusedIndex(-1);
        break;

      default:
        setIsExpanded(true);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSearchFocus = (): void => {
    setIsExpanded(true);
  };

  const handleItemClick = (
    employee: EmployeeDataType | L4ManagerType,
    index: number
  ): void => {
    toggleManagerSelection(employee);
    setFocusedIndex(index);
  };

  const getActiveDescendant = (): string | undefined => {
    return focusedIndex >= 0 && displayItems[focusedIndex]
      ? `manager-option-${displayItems[focusedIndex].employeeId}`
      : undefined;
  };
  const handleContainerKeyDown = (
    event: KeyboardEvent<HTMLDivElement>
  ): void => {
    if (filterOpen && shouldNavigateForward(event.key)) {
      setFilterOpen?.(false);
      setIsExpanded(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <Box
      sx={{ backgroundColor: theme.palette.grey[100], height: "100%" }}
      onKeyDown={handleContainerKeyDown}
    >
      <Box sx={{ p: "0.5rem" }}>
        <SearchBox
          label={""}
          value={managerSearchTerm}
          setSearchTerm={(value: string) => {
            const searchTerm = value.trimStart();
            onManagerSearchChange(undefined, searchTerm);
          }}
          searchBoxStyles={{
            height: "2.375rem",
            backgroundColor: "white"
          }}
          isSearchIconVisible={false}
          autoFocus={true}
          onKeyDown={handleKeyDown}
          onFocus={handleSearchFocus}
          inputProps={{
            "aria-label": translateAria(["searchManagers"]),
            "aria-expanded": isExpanded,
            "aria-activedescendant": getActiveDescendant(),
            "aria-autocomplete": "list",
            role: "combobox"
          }}
        />
      </Box>

      {isSearchResultsLoading && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            my: "0.5rem"
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Box
        ref={listRef}
        role="listbox"
        aria-label={translateAria(["managerOptions"])}
        aria-multiselectable="true"
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "15rem",
          mt: "0.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }}
      >
        {displayItems.map(
          (employee: EmployeeDataType | L4ManagerType, index: number) => {
            const isSelected = selectedManagers.some(
              (manager) => manager.employeeId === Number(employee.employeeId)
            );
            const isFocused = focusedIndex === index;

            return (
              <Stack
                key={employee.employeeId}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                id={`manager-option-${employee.employeeId}`}
                role="option"
                aria-selected={isSelected}
                aria-label={`${employee.firstName} ${employee.lastName}${isSelected ? `, ${translateAria(["selected"])}` : ""}`}
                tabIndex={-1}
                direction="row"
                sx={{
                  width: "100%",
                  px: "0.75rem",
                  backgroundColor: isFocused
                    ? theme.palette.action.hover
                    : !isSelected
                      ? theme.palette.grey[100]
                      : theme.palette.secondary.main,
                  outline: isFocused
                    ? `0.125rem solid ${theme.palette.common.black}`
                    : "none",
                  outlineOffset: "-0.125rem",
                  cursor: "pointer"
                }}
                onClick={() => handleItemClick(employee, index)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <Checkbox
                  label={""}
                  name={""}
                  checked={isSelected}
                  onChange={() => toggleManagerSelection(employee)}
                  customStyles={{
                    color: theme.palette.primary.dark,
                    "&.Mui-checked": {
                      color: theme.palette.primary.dark
                    }
                  }}
                  tabIndex={-1}
                />
                <Box
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  <AvatarChip
                    key={employee.employeeId}
                    firstName={employee.firstName ?? ""}
                    lastName={employee.lastName ?? ""}
                    avatarUrl={employee.authPic}
                    isResponsiveLayout={true}
                    chipStyles={{
                      color: "common.black",
                      height: "3rem",
                      border: isSelected
                        ? `.0625rem solid ${theme.palette.secondary.dark}`
                        : "common.white",
                      my: ".75rem",
                      py: "0.75rem",
                      "&:hover": {
                        backgroundColor: "common.white"
                      },
                      width: "fit-content"
                    }}
                    onClickChip={() => toggleManagerSelection(employee)}
                    tabIndex={-1}
                  />
                </Box>
              </Stack>
            );
          }
        )}
      </Box>
    </Box>
  );
};

export default MultiSelectManagerSearch;
