import {
  DataFilterEnums,
  EmployeeDataFilterTypes,
  EmploymentStatusTypes
} from "../types/EmployeeTypes";

export const handleApplyFilterPrams = (
  setEmployeeDataParams: (
    key: string,
    value: (string | number)[] | string
  ) => void,
  employeeDataFilter: EmployeeDataFilterTypes
) => {
  if (
    employeeDataFilter.employmentTypes &&
    employeeDataFilter.employmentTypes.length > 0
  ) {
    setEmployeeDataParams(
      DataFilterEnums.EMPLOYMENT_TYPES,
      employeeDataFilter.employmentTypes?.map((item) => item?.toUpperCase())
    );
  } else {
    setEmployeeDataParams(DataFilterEnums.EMPLOYMENT_TYPES, "");
  }

  if (
    employeeDataFilter.accountStatus &&
    employeeDataFilter.accountStatus.length > 0
  ) {
    setEmployeeDataParams(
      DataFilterEnums.ACCOUNT_STATUS,
      employeeDataFilter.accountStatus?.length > 0
        ? employeeDataFilter.accountStatus
        : [EmploymentStatusTypes.ACTIVE]
    );
  } else {
    setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
      EmploymentStatusTypes.ACTIVE
    ]);
  }

  if (
    employeeDataFilter.nationality &&
    employeeDataFilter.nationality.length > 0
  ) {
    setEmployeeDataParams(
      DataFilterEnums.NATIONALITY,
      employeeDataFilter.nationality?.map((item) => item?.toUpperCase())
    );
  } else {
    setEmployeeDataParams(DataFilterEnums.NATIONALITY, "");
  }

  if (
    employeeDataFilter.permission &&
    employeeDataFilter.permission.length > 0
  ) {
    setEmployeeDataParams(
      DataFilterEnums.PERMISSION,
      employeeDataFilter.permission as []
    );
  }

  if (
    employeeDataFilter.employmentAllocations &&
    employeeDataFilter.employmentAllocations.length > 0
  ) {
    setEmployeeDataParams(
      DataFilterEnums.EMPLOYMENT_ALLOCATIONS,
      employeeDataFilter.employmentAllocations?.map((item) =>
        item?.toUpperCase()
      )
    );
  }

  if (employeeDataFilter.gender) {
    setEmployeeDataParams(DataFilterEnums.GENDER, employeeDataFilter.gender);
  }

  if (employeeDataFilter.team && employeeDataFilter.team.length > 0) {
    setEmployeeDataParams(
      DataFilterEnums.TEAM,
      employeeDataFilter.team.map((team) => team.id) as []
    );
  } else {
    setEmployeeDataParams(DataFilterEnums.TEAM, "");
  }

  if (employeeDataFilter.role && employeeDataFilter.role.length > 0) {
    setEmployeeDataParams(
      DataFilterEnums.ROLE,
      employeeDataFilter.role.map((role) => role.id) as []
    );
  } else {
    setEmployeeDataParams(DataFilterEnums.ROLE, "");
  }

  if (
    employeeDataFilter.permission &&
    employeeDataFilter.permission.length > 0
  ) {
    setEmployeeDataParams(
      DataFilterEnums.PERMISSION,
      employeeDataFilter.permission?.map((item) => item?.toUpperCase())
    );
  } else {
    setEmployeeDataParams(DataFilterEnums.PERMISSION, "");
  }
};
