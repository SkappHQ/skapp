import { Checkbox as MuiCheckbox, CircularProgress } from "@mui/material";
import { FormikProps } from "formik";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { AvatarChip, AvatarGroup } from "@rootcodelabs/skapp-ui";
import Popper from "~community/common/components/molecules/Popper/Popper";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { testPassiveEventSupport } from "~community/common/utils/commonUtil";
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
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
}

const WorkLocationEmployeeSelector = ({ formik }: Props) => {
  const translateText = useTranslator("configurations", "workLocation");

  const [employeeSearchText, setEmployeeSearchText] = useState("");
  const [popperOpen, setPopperOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listInnerRef = useRef<HTMLDivElement>(null);
  const supportsPassive = testPassiveEventSupport();
  const [boxWidth, setBoxWidth] = useState(0);

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

  const allEmployees: AllEmployeeDataType[] =
    employeePages?.pages?.flatMap(
      (page: AllEmployeeDataResponse) => page?.items ?? []
    ) ?? [];

  const displayEmployees = useMemo(() => {
    return employeeSearchText.length > 0
      ? ((searchResults ?? []) as AllEmployeeDataType[])
      : allEmployees;
  }, [employeeSearchText, searchResults, allEmployees]);

  useEffect(() => {
    const listInnerElement = listInnerRef.current;

    const onScroll = () => {
      if (listInnerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight;
        if (isNearBottom && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      }
    };

    if (!isFetchingNextPage && listInnerElement) {
      listInnerElement.addEventListener(
        "touchmove",
        onScroll,
        supportsPassive ? { passive: true } : false
      );

      listInnerElement.addEventListener(
        "wheel",
        onScroll,
        supportsPassive ? { passive: true } : false
      );

      return () => {
        listInnerElement.removeEventListener("touchmove", onScroll);
        listInnerElement.removeEventListener("wheel", onScroll);
      };
    }
  }, [isFetchingNextPage, hasNextPage, supportsPassive, fetchNextPage]);

  const selectedIds: number[] = formik.values.employeeIds ?? [];
  const isAllSelected = formik.values.isAllEmployees;

  const selectedEmployees = useMemo(() => {
    return selectedIds
      .map((id) => allEmployees.find((e) => Number(e.employeeId) === id))
      .filter(Boolean) as AllEmployeeDataType[];
  }, [selectedIds, allEmployees]);

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
          showAvatar={false}
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
      <span className="body3 text-black mb-1 block">
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
          overflow: "hidden"
        }}
      >
        <div className="p-2">
          <SearchBox
            placeHolder={translateText(["form.assignEmployeesLabel"])}
            value={employeeSearchText}
            setSearchTerm={setEmployeeSearchText}
            autoFocus
          />
        </div>
        <div ref={listInnerRef} className="max-h-56 overflow-y-auto">
          <div
            className="flex items-center px-3 py-1 cursor-pointer hover:bg-secondary-background"
            onClick={toggleAllEmployees}
          >
            <MuiCheckbox
              checked={isAllSelected}
              size="small"
              sx={{ p: "0.25rem" }}
            />
            <AvatarChip
              label={translateText(["form.allEmployees"])}
              showAvatar={false}
            />
          </div>

          {!isAllSelected &&
            displayEmployees.map((emp) => {
              const empId = Number(emp.employeeId);
              const isSelected = selectedIds.includes(empId);
              return (
                <div
                  key={empId}
                  className="flex items-center px-3 py-1 cursor-pointer hover:bg-secondary-background"
                  onClick={() => toggleEmployee(empId)}
                >
                  <MuiCheckbox
                    checked={isSelected}
                    size="small"
                    sx={{ p: "0.25rem" }}
                  />
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
