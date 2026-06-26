import { EmploymentAllocationTypes } from "../types/AddNewResourceTypes";
import { EmploymentTypes, Role } from "../types/EmployeeTypes";

export const getTimelineValues = (
  value: string,
  translateText: (keys: string[]) => string
) => {
  switch (value) {
    case Role.SUPER_ADMIN:
      return translateText(["super_admin"]);
    case Role.ATTENDANCE_ADMIN:
      return translateText(["attendance_admin"]);
    case Role.ATTENDANCE_EMPLOYEE:
      return translateText(["attendance_employee"]);
    case Role.ATTENDANCE_MANAGER:
      return translateText(["attendance_manager"]);
    case Role.LEAVE_ADMIN:
      return translateText(["leave_admin"]);
    case Role.LEAVE_EMPLOYEE:
      return translateText(["leave_employee"]);
    case Role.LEAVE_MANAGER:
      return translateText(["leave_manager"]);
    case Role.PEOPLE_ADMIN:
      return translateText(["people_admin"]);
    case Role.PEOPLE_EMPLOYEE:
      return translateText(["people_employee"]);
    case Role.PEOPLE_MANAGER:
      return translateText(["people_manager"]);
    case EmploymentTypes.PERMANENT:
      return translateText(["permanent"]);
    case EmploymentTypes.CONTRACT:
      return translateText(["contract"]);
    case EmploymentTypes.INTERN:
      return translateText(["intern"]);
    case EmploymentAllocationTypes.FULL_TIME:
      return translateText(["full_time"]);
    case EmploymentAllocationTypes.PART_TIME:
      return translateText(["part_time"]);
    default:
      return value;
  }
};
