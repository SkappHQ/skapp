import { CircularProgress } from "@mui/material";
import { Checkbox } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import Popper from "~community/common/components/molecules/Popper/Popper";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
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
  const { data: searchResults } = useGetSearchedEmployees(employeeSearchText);

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

  const renderAllEmployeesChip = () => (
    <AvatarChip
      firstName={translateText(["form.allEmployees"]).trim()}
      lastName=""
      avatarUrl={undefined}
      isTooltipEnabled
    />
  );

  const renderTriggerContent = () => {
    if (selectedCount === 0) {
      return (
        <span className="body1 text-secondary-text">
          {translateText(["form.assignEmployeesLabel"])}
        </span>
      );
    }

    if (isAllSelected) {
      return renderAllEmployeesChip();
    }

    if (selectedCount <= 2) {
      return (
        <div className="flex gap-2">
          {selectedEmployees.map((emp) => (
            <AvatarChip
              key={emp.employeeId}
              firstName={emp.firstName ?? ""}
              lastName={(emp.lastName ?? "").trim()}
              avatarUrl={emp.authPic}
              isTooltipEnabled
            />
          ))}
        </div>
      );
    }

    const remainingEmployees = selectedEmployees.slice(3);
    const remainingTitle = remainingEmployees
      .map((emp) => `${emp.firstName ?? ""} ${(emp.lastName ?? "").trim()}`.trim())
      .join(", ");

    return (
      <AvatarGroup
        avatars={selectedEmployees.map((emp) => ({
          firstName: emp.firstName ?? "",
          lastName: (emp.lastName ?? "").trim(),
          image: emp.authPic || null
        }))}
        max={4}
        title={remainingTitle || undefined}
      />
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
        className="bg-tertiary-background h-12 rounded-lg flex items-center w-full cursor-pointer px-3 focus:outline-1 focus:outline-primary-accent focus:-outline-offset-[2px]"
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
        <div ref={listRefCallback} role="listbox" className="max-h-56 overflow-y-auto">
          {!isAllSelected && selectedEmployees.length > 0 && (
            <>
              {selectedEmployees
                .filter(
                  (emp) =>
                    employeeSearchText.length === 0 ||
                    `${emp.firstName ?? ""} ${emp.lastName ?? ""}`
                      .toLowerCase()
                      .includes(employeeSearchText.toLowerCase())
                )
                .map((emp) => {
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
                      <AvatarChip
                        firstName={emp.firstName ?? ""}
                        lastName={(emp.lastName ?? "").trim()}
                        avatarUrl={emp.authPic}
                        isTooltipEnabled
                      />
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
              {renderAllEmployeesChip()}
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
                    <AvatarChip
                      firstName={emp.firstName ?? ""}
                      lastName={(emp.lastName ?? "").trim()}
                      avatarUrl={emp.authPic}
                      isTooltipEnabled
                    />
                  </div>
                );
              })}

          {employeeSearchText.length > 0 &&
            displayEmployees.length === 0 && (
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
