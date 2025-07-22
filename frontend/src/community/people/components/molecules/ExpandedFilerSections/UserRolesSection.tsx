import { Stack } from "@mui/material";
import { useSession } from "next-auth/react";
import { RefObject } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { EmployeeTypes } from "~community/common/types/AuthTypes";
import { usePeopleStore } from "~community/people/store/store";
import { Role } from "~community/people/types/EmployeeTypes";

import EmployeeFilterSection from "../EmployeeFilterSection/EmployeeFilterSection";

const UserRolesSection = ({
  selected,
  basicChipRef
}: {
  selected: string;
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  const translateText = useTranslator(
    "peopleModule",
    "peoples.filters.userRolesFilters"
  );

  const { employeeDataFilter, setEmployeeDataFilter } = usePeopleStore(
    (state) => state
  );

  const { data: sessionData } = useSession();

  const peopleRoles = [
    { label: translateText(["admin"]), value: Role.PEOPLE_ADMIN },
    { label: translateText(["manager"]), value: Role.PEOPLE_MANAGER },
    { label: translateText(["employee"]), value: Role.PEOPLE_EMPLOYEE }
  ];

  const attendanceRoles = [
    { label: translateText(["admin"]), value: Role.ATTENDANCE_ADMIN },
    {
      label: translateText(["manager"]),
      value: Role.ATTENDANCE_MANAGER
    },
    {
      label: translateText(["employee"]),
      value: Role.ATTENDANCE_EMPLOYEE
    }
  ];

  const leaveRoles = [
    { label: translateText(["admin"]), value: Role.LEAVE_ADMIN },
    { label: translateText(["manager"]), value: Role.LEAVE_MANAGER },
    { label: translateText(["employee"]), value: Role.LEAVE_EMPLOYEE }
  ];

  const esignRoles = [
    { label: translateText(["admin"]), value: Role.ESIGN_ADMIN },
    { label: translateText(["sender"]), value: Role.ESIGN_SENDER },
    { label: translateText(["employee"]), value: Role.ESIGN_EMPLOYEE }
  ];
  const filterData = [
    ...(sessionData?.user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)
      ? [
          {
            title: translateText(["attendanceModule"]),
            filterKey: "permission",
            accessibilityKey: "attendance",
            roles: attendanceRoles
          }
        ]
      : []),
    ...(sessionData?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE)
      ? [
          {
            title: translateText(["leaveModule"]),
            filterKey: "permission",
            accessibilityKey: "leave",
            roles: leaveRoles
          }
        ]
      : []),
    {
      title: translateText(["peopleModule"]),
      accessibilityKey: "people",
      filterKey: "permission",
      roles: peopleRoles
    },
    ...(sessionData?.user?.roles?.includes(EmployeeTypes.ESIGN_EMPLOYEE)
      ? [
          {
            title: translateText(["esignModule"]),
            filterKey: "permission",
            accessibilityKey: "esign",
            roles: esignRoles
          }
        ]
      : [])
  ];

  const handleFilterChange = (
    value: string,
    filterKey: string,
    currentFilter: string[]
  ) => {
    if (!currentFilter.includes(value)) {
      setEmployeeDataFilter(filterKey, [...currentFilter, value]);
    } else {
      setEmployeeDataFilter(
        filterKey,
        currentFilter.filter((currentItem) => currentItem !== value)
      );
    }
  };

  return (
    <Stack
      sx={{
        overflowY: "auto",
        flexDirection: "column",
        maxHeight: "20rem"
      }}
    >
      {filterData.map((filter) => (
        <EmployeeFilterSection
          basicChipRef={basicChipRef}
          selected={selected}
          accessibilityKey={filter.filterKey}
          key={filter.title}
          title={filter.title}
          data={filter.roles}
          handleFilterChange={handleFilterChange}
          currentFilter={employeeDataFilter[filter.filterKey]}
        />
      ))}
    </Stack>
  );
};

export default UserRolesSection;
