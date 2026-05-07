import { Box, Checkbox as MuiCheckbox, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import Popper from "~community/common/components/molecules/Popper/Popper";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import {
  AvatarPropTypes,
  MenuTypes
} from "~community/common/types/MoleculeTypes";
import {
  useGetEmployeeData,
  useGetSearchedEmployees
} from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  DataFilterEnums,
  EmploymentStatusTypes
} from "~community/people/types/EmployeeTypes";
import { AllEmployeeDataType } from "~community/people/types/PeopleTypes";
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
  const [boxWidth, setBoxWidth] = useState(0);

  const { setEmployeeDataParams } = usePeopleStore((state) => state);

  useEffect(() => {
    setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
      EmploymentStatusTypes.ACTIVE,
      EmploymentStatusTypes.PENDING
    ]);
  }, [setEmployeeDataParams]);

  const { data: employeePages } = useGetEmployeeData();
  const { data: searchResults } = useGetSearchedEmployees(employeeSearchText);

  const allEmployees: AllEmployeeDataType[] =
    employeePages?.pages?.flatMap((page: any) => page?.items ?? []) ?? [];

  const displayEmployees = useMemo(() => {
    return employeeSearchText.length > 0
      ? ((searchResults ?? []) as AllEmployeeDataType[])
      : allEmployees;
  }, [employeeSearchText, searchResults, allEmployees]);

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

  return (
    <div>
      <Typography
        variant="placeholder"
        gutterBottom
        sx={{ color: "common.black" }}
      >
        {translateText(["form.assignEmployeesLabel"])}
      </Typography>
      <Box
        ref={boxRef}
        tabIndex={0}
        role="combobox"
        aria-expanded={popperOpen}
        aria-haspopup="listbox"
        aria-label={translateText(["form.assignEmployeesLabel"])}
        sx={{
          backgroundColor: theme.palette.grey[100],
          height: "3rem",
          borderRadius: "0.5rem",
          display: "flex",
          alignItems: "center",
          width: "100%",
          cursor: "pointer",
          px: "0.75rem",
          "&:focus": {
            outline: `0.125rem solid ${theme.palette.common.black}`,
            outlineOffset: "-0.125rem"
          }
        }}
        onClick={handleTriggerClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleTriggerClick(event as unknown as MouseEvent<HTMLDivElement>);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            boxRef.current?.blur();
          }
        }}
      >
        {selectedCount === 0 ? (
          <Typography
            variant="placeholder"
            sx={{ color: theme.palette.text.secondary, ml: "0.5rem" }}
          >
            {translateText(["form.assignEmployeesLabel"])}
          </Typography>
        ) : isAllSelected ? (
          <AvatarChip
            firstName="All"
            lastName="Employees"
            avatarUrl={undefined}
            chipStyles={{
              backgroundColor: "common.white",
              color: "common.black",
              height: "2.5rem"
            }}
          />
        ) : selectedCount <= 2 ? (
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            {selectedEmployees.map((emp) => (
              <AvatarChip
                key={emp.employeeId}
                firstName={emp.firstName ?? ""}
                lastName={selectedCount === 1 ? (emp.lastName ?? "") : ""}
                avatarUrl={emp.authPic}
                chipStyles={{
                  backgroundColor: "common.white",
                  color: "common.black",
                  height: "2.5rem"
                }}
              />
            ))}
          </Box>
        ) : (
          <AvatarGroup
            componentStyles={{
              ".MuiAvatarGroup-avatar": {
                bgcolor: theme.palette.grey[100],
                color: theme.palette.primary.dark,
                fontSize: "0.875rem",
                height: "2.5rem",
                width: "2.5rem",
                fontWeight: 400
              }
            }}
            avatars={selectedEmployees.map(
              (emp) =>
                ({
                  firstName: emp.firstName,
                  lastName: emp.lastName,
                  image: emp.authPic
                }) as AvatarPropTypes
            )}
            max={3}
          />
        )}
      </Box>

      <Popper
        anchorEl={anchorEl}
        open={popperOpen}
        position="bottom-end"
        menuType={MenuTypes.FILTER}
        id={popperOpen ? "employee-select-popper" : undefined}
        handleClose={handlePopperClose}
        timeout={300}
        containerStyles={{
          maxHeight: "20.25rem",
          width: `${boxWidth}px`,
          backgroundColor: theme.palette.notifyBadge.contrastText,
          boxShadow: theme.shadows[1],
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: "0.5rem" }}>
          <SearchBox
            placeHolder={translateText(["form.assignEmployeesLabel"])}
            value={employeeSearchText}
            setSearchTerm={setEmployeeSearchText}
            autoFocus
          />
        </Box>
        <Box sx={{ maxHeight: "14rem", overflowY: "auto" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: "0.75rem",
              py: "0.25rem",
              cursor: "pointer",
              "&:hover": { backgroundColor: theme.palette.grey[100] }
            }}
            onClick={toggleAllEmployees}
          >
            <MuiCheckbox
              checked={isAllSelected}
              size="small"
              sx={{ p: "0.25rem" }}
            />
            <AvatarChip
              firstName="All"
              lastName="Employees"
              avatarUrl={undefined}
              chipStyles={{
                backgroundColor: "transparent",
                color: "common.black",
                height: "2.5rem",
                border: "none",
                boxShadow: "none"
              }}
            />
          </Box>

          {!isAllSelected &&
            displayEmployees.map((emp) => {
              const empId = Number(emp.employeeId);
              const isSelected = selectedIds.includes(empId);
              return (
                <Box
                  key={empId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: "0.75rem",
                    py: "0.25rem",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: theme.palette.grey[100] }
                  }}
                  onClick={() => toggleEmployee(empId)}
                >
                  <MuiCheckbox
                    checked={isSelected}
                    size="small"
                    sx={{ p: "0.25rem" }}
                  />
                  <AvatarChip
                    firstName={emp.firstName ?? ""}
                    lastName={emp.lastName ?? ""}
                    avatarUrl={emp.authPic}
                    chipStyles={{
                      backgroundColor: "transparent",
                      color: "common.black",
                      height: "2.5rem",
                      border: "none",
                      boxShadow: "none"
                    }}
                  />
                </Box>
              );
            })}
        </Box>
      </Popper>
    </div>
  );
};

export default WorkLocationEmployeeSelector;
