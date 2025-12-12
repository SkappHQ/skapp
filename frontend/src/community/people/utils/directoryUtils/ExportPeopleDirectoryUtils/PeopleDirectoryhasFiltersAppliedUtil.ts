import { EmployeeDataFilterTypes } from "~community/people/types/EmployeeTypes";

export const hasFiltersApplied = (
  employeeDataFilter: EmployeeDataFilterTypes
): boolean => {
  const filters = employeeDataFilter || {};

  return Object.values(filters).some((filterValue) => {
    if (Array.isArray(filterValue)) {
      return filterValue.length > 0;
    }
    if (typeof filterValue === "number") {
      return filterValue > 0;
    }
    return Boolean(filterValue);
  });
};
