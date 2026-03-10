import { SelectableItemList } from "@rootcodelabs/skapp-ui";
import { RefObject } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { EmployeeTypes } from "~community/common/types/AuthTypes";
import { usePeopleStore } from "~community/people/store/store";
import {
  EmployeeDataFilterTypes,
  Role
} from "~community/people/types/EmployeeTypes";

const UserRolesSection = ({
  basicChipRef
}: {
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  const translateText = useTranslator(
    "peopleModule",
    "peoples.filters.userRolesFilters"
  );

  const { employeeDataFilter, setEmployeeDataFilter } = usePeopleStore(
    (state) => state
  );

  const { user } = useAuth();

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
    ...(user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)
      ? [
          {
            title: translateText(["attendanceModule"]),
            filterKey: "permission",
            accessibilityKey: "attendance",
            roles: attendanceRoles
          }
        ]
      : []),
    ...(user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE)
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
    ...(user?.roles?.includes(EmployeeTypes.ESIGN_EMPLOYEE)
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
    <div className="overflow-y-auto flex flex-col gap-6">
      {filterData.map((filter) => {
        const currentFilterValues = (employeeDataFilter[
          filter.filterKey as keyof EmployeeDataFilterTypes
        ] ?? []) as string[];
        return (
          <SelectableItemList
            key={filter.title}
            title={filter.title}
            items={filter.roles}
            selectedValues={currentFilterValues}
            onChipClick={(value) =>
              handleFilterChange(value, filter.filterKey, currentFilterValues)
            }
            chipRefs={basicChipRef}
          />
        );
      })}
    </div>
  );
};

export default UserRolesSection;
