import {
  EmployeeDataManagerType,
  EmployeeDataTeamType
} from "../types/PeopleTypes";

//Returns: "Name: Peter Smith, Job Title: Software Engineer, Email: peter@gmail.com, Teams: Finance, Sales, Supervisor: John Smith. Click to go to Employee View"
export const generatePeopleTableRowAriaLabel = (
  translateAria: (path: string[], params?: Record<string, any>) => string,
  isPendingInvitation: boolean,
  employee: {
    firstName?: string | null;
    lastName?: string | null;
    jobTitle?: string | null;
    email?: string | null;
    teams?: EmployeeDataTeamType[] | null;
    managers?: EmployeeDataManagerType[] | null;
  }
): string => {
  return translateAria(
    [isPendingInvitation ? "peopleTableRowPending" : "peopleTableRow"],
    {
      name: `${employee?.firstName || ""} ${employee?.lastName || ""}`,
      jobTitle: employee?.jobTitle
        ? employee?.jobTitle
        : translateAria(["empty"]),
      email: employee?.email || "",
      teams:
        employee?.teams && employee.teams.length > 0
          ? employee.teams.map((team) => team.teamName).join(", ")
          : translateAria(["empty"]),
      supervisor:
        employee?.managers && employee.managers.length > 0
          ? employee?.managers
              ?.map(
                (manager) =>
                  `${manager.firstName || ""} ${manager.lastName || ""}`
              )
              .join(", ")
          : translateAria(["empty"])
    }
  );
};

// Returns: "Row: Date 11th Feb 2025; Duration Full Day; Holiday Name: Independence Day; Delete holiday Disabled "
export const generateHolidayTableRowAriaLabel = (
  translateAria: (key: string[], params?: Record<string, any>) => string,
  date: string,
  duration: string,
  holidayName: string,
  isDisabled: boolean
): string => {
  return translateAria(["holidayTableRow"], {
    date,
    duration,
    holidayName,
    status: isDisabled
      ? translateAria(["disabled"])
      : translateAria(["enabled"])
  });
};
