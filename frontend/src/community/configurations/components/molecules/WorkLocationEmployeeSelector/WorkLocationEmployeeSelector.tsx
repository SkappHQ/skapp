import { CircularProgress } from "@mui/material";
import { Avatar, AvatarChip, Checkbox } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import EmployeeAvatarChip from "~community/common/components/atoms/EmployeeAvatarChip/EmployeeAvatarChip";
import EmployeeGroupAvatar from "~community/common/components/atoms/EmployeeGroupAvatar/EmployeeGroupAvatar";
import Popper from "~community/common/components/molecules/Popper/Popper";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { getEmployeeAvatarName } from "~community/common/utils/commonUtil";
import {
  WorkLocationEmployee,
  WorkLocationFormValues
} from "~community/configurations/types/WorkLocationTypes";
import {
  useGetEmployeeData,
  useGetSearchedEmployees
} from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  DataFilterEnums,
  EmploymentStatusTypes
} from "~community/people/types/EmployeeTypes";
import {
  AllEmployeeDataResponse,
  AllEmployeeDataType
} from "~community/people/types/PeopleTypes";

const MAX_INLINE_CHIPS = 2;
const MAX_VISIBLE_AVATARS = 4;

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
  preloadedEmployees?: WorkLocationEmployee[];
}

const WorkLocationEmployeeSelector = ({
  formik,
  preloadedEmployees = []
}: Props) => {
  const translateText = useTranslator("configurations", "workLocation");

  const [employeeSearchText, setEmployeeSearchText] = useState("");
  const [popperOpen, setPopperOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listInnerRef = useRef<HTMLDivElement | null>(null);
  const scrollCleanupRef = useRef<(() => void) | null>(null);
  const searchTextRef = useRef(employeeSearchText);

  useEffect(() => {
    searchTextRef.current = employeeSearchText;
  });
  const [boxWidth, setBoxWidth] = useState(0);
  const [employeeMap, setEmployeeMap] = useState<
    Map<number, AllEmployeeDataType>
  >(() => {
    const initialMap = new Map<number, AllEmployeeDataType>();
    for (const emp of preloadedEmployees) {
      initialMap.set(emp.employeeId, {
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName ?? "",
        authPic: emp.authPic ?? ""
      });
    }
    return initialMap;
  });

  const { setEmployeeDataParams } = usePeopleStore((state) => state);

  useEffect(() => {
    setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
      EmploymentStatusTypes.ACTIVE,
      EmploymentStatusTypes.PENDING
    ]);
  }, [setEmployeeDataParams]);

  const {
    data: employeePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetEmployeeData();
  const { data: searchResults, isFetching: isFetchingSearchResults } =
    useGetSearchedEmployees(employeeSearchText);

  const debouncedSearchText = useDebounce(employeeSearchText, 500);
  const isSearchPending =
    employeeSearchText.length > 0 &&
    (employeeSearchText !== debouncedSearchText || isFetchingSearchResults);

  const allEmployees: AllEmployeeDataType[] = useMemo(
    () =>
      employeePages?.pages?.flatMap(
        (page: AllEmployeeDataResponse) => page?.items ?? []
      ) ?? [],
    [employeePages]
  );

  const displayEmployees = useMemo(() => {
    return employeeSearchText.length > 0
      ? ((searchResults ?? []) as AllEmployeeDataType[])
      : allEmployees;
  }, [employeeSearchText, searchResults, allEmployees]);

  // Attach scroll listener via callback ref so it fires when the DOM element
  // actually mounts inside the Popper (not before).
  const listRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      // Clean up previous listener
      if (scrollCleanupRef.current) {
        scrollCleanupRef.current();
        scrollCleanupRef.current = null;
      }

      listInnerRef.current = node;

      if (!node) return;

      const onScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = node;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;
        if (
          isNearBottom &&
          !isFetchingNextPage &&
          hasNextPage &&
          searchTextRef.current.length === 0
        ) {
          fetchNextPage();
        }
      };

      node.addEventListener("scroll", onScroll);
      scrollCleanupRef.current = () =>
        node.removeEventListener("scroll", onScroll);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Auto-fetch next page if the list doesn't overflow (no scrollbar = no scroll event).
  useEffect(() => {
    const el = listInnerRef.current;
    if (
      el &&
      popperOpen &&
      !isFetchingNextPage &&
      hasNextPage &&
      searchTextRef.current.length === 0 &&
      el.scrollHeight <= el.clientHeight
    ) {
      fetchNextPage();
    }
  }, [
    popperOpen,
    allEmployees,
    employeeSearchText,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  ]);

  const selectedIds: number[] = formik.values.employeeIds ?? [];
  const isAllSelected = formik.values.isAllEmployees;

  useEffect(() => {
    setEmployeeMap((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const emp of allEmployees) {
        if (!next.has(emp.employeeId)) {
          next.set(emp.employeeId, emp);
          changed = true;
        }
      }
      for (const emp of (searchResults ?? []) as AllEmployeeDataType[]) {
        if (!next.has(emp.employeeId)) {
          next.set(emp.employeeId, emp);
          changed = true;
        }
      }
      for (const emp of preloadedEmployees) {
        if (!next.has(emp.employeeId)) {
          next.set(emp.employeeId, {
            employeeId: emp.employeeId,
            firstName: emp.firstName,
            lastName: emp.lastName ?? "",
            authPic: emp.authPic ?? ""
          });
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [allEmployees, searchResults, preloadedEmployees]);

  const selectedEmployees = useMemo(
    () =>
      selectedIds
        .map((id) => employeeMap.get(id))
        .filter(Boolean) as AllEmployeeDataType[],
    [selectedIds, employeeMap]
  );

  const selectedCount = isAllSelected
    ? allEmployees.length
    : selectedIds.length;

  const visibleEmployees = useMemo(
    () => selectedEmployees.slice(0, MAX_VISIBLE_AVATARS),
    [selectedEmployees]
  );

  const remainingEmployees = useMemo(
    () => selectedEmployees.slice(MAX_VISIBLE_AVATARS),
    [selectedEmployees]
  );

  const selectedEmployeesLabel = useMemo(
    () => selectedEmployees.map(getEmployeeAvatarName).join(", "),
    [selectedEmployees]
  );

  const remainingEmployeesLabel = useMemo(
    () => remainingEmployees.map(getEmployeeAvatarName).join(", "),
    [remainingEmployees]
  );

  const filteredSelectedEmployees = useMemo(
    () =>
      selectedEmployees.filter((emp) =>
        getEmployeeAvatarName(emp)
          .toLowerCase()
          .includes(employeeSearchText.toLowerCase())
      ),
    [selectedEmployees, employeeSearchText]
  );

  useEffect(() => {
    if (boxRef.current) {
      setBoxWidth(boxRef.current.clientWidth);
    }
  }, [popperOpen]);

  const handlePopperClose = () => {
    setPopperOpen(false);
    setAnchorEl(null);
    setEmployeeSearchText("");
  };

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    setEmployeeSearchText("");
    setAnchorEl(event.currentTarget);
    setPopperOpen((prev) => !prev);
  };

  const toggleEmployee = (empId: number) => {
    if (selectedIds.includes(empId)) {
      formik.setFieldValue(
        "employeeIds",
        selectedIds.filter((id) => id !== empId)
      );
    } else {
      formik.setFieldValue("employeeIds", [...selectedIds, empId]);
    }
  };

  const toggleAllEmployees = () => {
    if (isAllSelected) {
      formik.setFieldValue("isAllEmployees", false);
    } else {
      formik.setFieldValue("isAllEmployees", true);
      formik.setFieldValue("employeeIds", []);
    }
  };

  const renderAllEmployeesChip = (idPrefix: string) => {
    const allEmployeesLabel = translateText(["form.allEmployees"]).trim();

    return (
      <div className="w-fit min-w-0 max-w-full">
        <AvatarChip
          avatarProps={{
            id: `${idPrefix}-all-employees`,
            firstName: allEmployeesLabel,
            size: "sm",
            isPlaceholder: true
          }}
          label={allEmployeesLabel}
        />
      </div>
    );
  };

  const renderTriggerContent = () => {
    if (isAllSelected) {
      return renderAllEmployeesChip("trigger");
    }

    if (selectedCount === 0) {
      return (
        <span className="body1 text-secondary-text">
          {translateText(["form.assignEmployeesLabel"])}
        </span>
      );
    }

    if (selectedCount <= MAX_INLINE_CHIPS) {
      return (
        <div className="flex min-w-0 gap-2">
          {selectedEmployees.map((emp) => (
            <EmployeeAvatarChip
              key={emp.employeeId}
              employee={emp}
              className="w-fit min-w-0 max-w-full"
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className="flex min-w-0 max-w-full -space-x-3"
        role="group"
        aria-label={selectedEmployeesLabel}
      >
        {visibleEmployees.map((emp) => (
          <EmployeeGroupAvatar key={emp.employeeId} employee={emp} />
        ))}
        {remainingEmployees.length > 0 && (
          <Avatar
            id="avatar-surplus"
            count={remainingEmployees.length}
            title={remainingEmployeesLabel}
            size="sm"
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <span className="subtitle1 mb-2 block">
        {translateText(["form.assignEmployeesLabel"])}
      </span>
      <div
        ref={boxRef}
        tabIndex={0}
        role="combobox"
        aria-expanded={popperOpen}
        aria-haspopup="listbox"
        aria-label={translateText(["form.assignEmployeesLabel"])}
        className="bg-tertiary-background h-12 rounded-lg flex items-center w-full min-w-0 overflow-hidden cursor-pointer px-3 focus:outline-1 focus:outline-primary-accent focus:-outline-offset-[2px]"
        onClick={handleTriggerClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleTriggerClick(event as unknown as MouseEvent<HTMLDivElement>);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            handlePopperClose();
          }
          if (event.key === "Tab") {
            handlePopperClose();
          }
        }}
      >
        {renderTriggerContent()}
      </div>

      <Popper
        anchorEl={anchorEl}
        open={popperOpen}
        position="bottom-end"
        menuType={MenuTypes.FILTER}
        id={popperOpen ? "employee-select-popper" : undefined}
        handleClose={handlePopperClose}
        containerStyles={{
          maxHeight: "20.25rem",
          width: `${boxWidth}px`,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          overflow: "hidden",
          backgroundColor: "var(--color-tertiary-background)"
        }}
      >
        <SearchBox
          placeHolder={translateText(["form.assignEmployeesLabel"])}
          value={employeeSearchText}
          setSearchTerm={setEmployeeSearchText}
          autoFocus
        />
        <div
          ref={listRefCallback}
          role="listbox"
          className="max-h-56 overflow-y-auto"
        >
          {!isAllSelected && filteredSelectedEmployees.length > 0 && (
            <>
              {filteredSelectedEmployees.map((emp) => {
                const empId = emp.employeeId;
                return (
                  <div
                    key={empId}
                    role="option"
                    tabIndex={0}
                    aria-selected={true}
                    className="flex items-center gap-3 px-3 py-1 cursor-pointer hover:bg-secondary-background"
                    onClick={() => toggleEmployee(empId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleEmployee(empId);
                      }
                    }}
                  >
                    <Checkbox checked={true} />
                    <EmployeeAvatarChip employee={emp} />
                  </div>
                );
              })}
              <hr className="border-secondary-accent my-2 mx-3" />
            </>
          )}

          {employeeSearchText.length === 0 && (
            <div
              role="option"
              tabIndex={0}
              aria-selected={isAllSelected}
              className="flex items-center gap-3 px-3 py-1 cursor-pointer hover:bg-secondary-background"
              onClick={toggleAllEmployees}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleAllEmployees();
                }
              }}
            >
              <Checkbox checked={isAllSelected} />
              {renderAllEmployeesChip("option")}
            </div>
          )}

          {!isAllSelected &&
            displayEmployees
              .filter((emp) => !selectedIds.includes(emp.employeeId))
              .map((emp) => {
                const empId = emp.employeeId;
                return (
                  <div
                    key={empId}
                    role="option"
                    tabIndex={0}
                    aria-selected={false}
                    className="flex items-center gap-3 px-3 py-1 cursor-pointer hover:bg-secondary-background"
                    onClick={() => toggleEmployee(empId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleEmployee(empId);
                      }
                    }}
                  >
                    <Checkbox checked={false} />
                    <EmployeeAvatarChip employee={emp} />
                  </div>
                );
              })}

          {isSearchPending && (
            <div className="flex justify-center py-2">
              <CircularProgress size={20} />
            </div>
          )}

          {employeeSearchText.length > 0 &&
            !isSearchPending &&
            displayEmployees.length === 0 &&
            filteredSelectedEmployees.length === 0 && (
              <p className="text-center text-secondary-text body2 py-4">
                {translateText(["form.noSearchResults"])}
              </p>
            )}

          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <CircularProgress size={20} />
            </div>
          )}
        </div>
      </Popper>
    </div>
  );
};

export default WorkLocationEmployeeSelector;
