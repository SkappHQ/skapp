import { CircularProgress } from "@mui/material";
import { FormikProps } from "formik";
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AvatarChip, AvatarGroup, Checkbox } from "@rootcodelabs/skapp-ui";
import Popper from "~community/common/components/molecules/Popper/Popper";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { MenuTypes } from "~community/common/types/MoleculeTypes";

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
import { WorkLocationEmployee, WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
  preloadedEmployees?: WorkLocationEmployee[];
}

const WorkLocationEmployeeSelector = ({ formik, preloadedEmployees = [] }: Props) => {
  const translateText = useTranslator("configurations", "workLocation");

  const [employeeSearchText, setEmployeeSearchText] = useState("");
  const [popperOpen, setPopperOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listInnerRef = useRef<HTMLDivElement | null>(null);
  const scrollCleanupRef = useRef<(() => void) | null>(null);
  const selectedIdsRef = useRef<number[]>([]);
  const [boxWidth, setBoxWidth] = useState(0);
  const [stableSelected, setStableSelected] = useState<AllEmployeeDataType[]>([]);
  const [stableUnselected, setStableUnselected] = useState<AllEmployeeDataType[]>([]);

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
        if (isNearBottom && !isFetchingNextPage && hasNextPage) {
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
      el.scrollHeight <= el.clientHeight
    ) {
      fetchNextPage();
    }
  }, [popperOpen, allEmployees, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const selectedIds: number[] = formik.values.employeeIds ?? [];
  selectedIdsRef.current = selectedIds;
  const isAllSelected = formik.values.isAllEmployees;

  const selectedEmployees = useMemo(() => {
    return selectedIds
      .map((id) => {
        const fromList = allEmployees.find((e) => Number(e.employeeId) === id);
        if (fromList) return fromList;
        const fromSearch = (searchResults ?? []).find(
          (e) => Number(e.employeeId) === id
        ) as AllEmployeeDataType | undefined;
        if (fromSearch) return fromSearch;
        const fromPreloaded = preloadedEmployees.find(
          (e) => e.employeeId === id
        );
        if (fromPreloaded) {
          return {
            employeeId: fromPreloaded.employeeId,
            firstName: fromPreloaded.firstName,
            lastName: fromPreloaded.lastName ?? "",
            authPic: fromPreloaded.authPic ?? ""
          } as AllEmployeeDataType;
        }
        return undefined;
      })
      .filter(Boolean) as AllEmployeeDataType[];
  }, [selectedIds, allEmployees, searchResults, preloadedEmployees]);

  // Re-sort the display list (selected at top) only when the popper opens or
  // the underlying data changes. Intentionally does NOT react to selectedIds changes
  // so that items stay in place while the user is making selections (no jumping).
  useEffect(() => {
    if (!popperOpen) return;
    const ids = selectedIdsRef.current;
    const selected = displayEmployees.filter((e) =>
      ids.includes(Number(e.employeeId))
    );
    const unselected = displayEmployees.filter(
      (e) => !ids.includes(Number(e.employeeId))
    );
    setStableSelected(selected);
    setStableUnselected(unselected);
  }, [popperOpen, displayEmployees]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCount = isAllSelected ? allEmployees.length : selectedIds.length;

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

  const renderTriggerContent = () => {
    if (selectedCount === 0) {
      return (
        <span className="body3 text-secondary-text ml-2">
          {translateText(["form.assignEmployeesLabel"])}
        </span>
      );
    }

    if (isAllSelected) {
      return (
        <AvatarChip
          label={translateText(["form.allEmployees"])}
          showAvatar={true}
        />
      );
    }

    if (selectedCount <= 2) {
      return (
        <div className="flex gap-2">
          {selectedEmployees.map((emp) => (
            <AvatarChip
              key={emp.employeeId}
              label={
                selectedCount === 1
                  ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()
                  : (emp.firstName ?? "")
              }
              avatarProps={{
                id: String(emp.employeeId),
                firstName: emp.firstName,
                lastName: emp.lastName,
                src: emp.authPic
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <AvatarGroup
        avatars={selectedEmployees.map((emp) => ({
          id: String(emp.employeeId),
          firstName: emp.firstName,
          lastName: emp.lastName,
          src: emp.authPic
        }))}
        maxVisible={3}
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
        className="bg-secondary-background h-12 rounded-lg flex items-center w-full cursor-pointer px-3 focus:outline-2 focus:outline-black focus:-outline-offset-[2px]"
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
        <div ref={listRefCallback} className="max-h-56 overflow-y-auto">
          {!isAllSelected && selectedEmployees.length > 0 && (
            <>
              {selectedEmployees.map((emp) => {
                const empId = Number(emp.employeeId);
                return (
                  <div
                    key={empId}
                    className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-secondary-background"
                    onClick={() => toggleEmployee(empId)}
                  >
                    <Checkbox checked={true} />
                    <AvatarChip
                      label={`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()}
                      avatarProps={{
                        id: String(emp.employeeId),
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        src: emp.authPic
                      }}
                    />
                  </div>
                );
              })}
              <hr className="border-secondary-background my-1 mx-3" />
            </>
          )}

          <div
            className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-secondary-background"
            onClick={toggleAllEmployees}
          >
            <Checkbox
              checked={isAllSelected}
            />
            <AvatarChip
              label={translateText(["form.allEmployees"])}
            />
          </div>

          {!isAllSelected &&
            stableUnselected
              .filter((emp) => !selectedIds.includes(Number(emp.employeeId)))
              .map((emp) => {
              const empId = Number(emp.employeeId);
              const isSelected = selectedIds.includes(empId);
              return (
                <div
                  key={empId}
                  className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-secondary-background"
                  onClick={() => toggleEmployee(empId)}
                >
                  <Checkbox checked={isSelected} />
                  <AvatarChip
                    label={`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()}
                    avatarProps={{
                      id: String(emp.employeeId),
                      firstName: emp.firstName,
                      lastName: emp.lastName,
                      src: emp.authPic
                    }}
                  />
                </div>
              );
            })}

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
