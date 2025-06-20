//Returns: "Name: Peter Smith, Job Title: Software Engineer, Email: peter@gmail.com, Teams: Finance, Sales, Supervisor: John Smith. Click to go to Employee View"
export const generatePeopleTableRowAriaLabel = (
  translateAria: (path: string[], params?: Record<string, any>) => string,
  isPendingInvitation: boolean,
  employee: {
    firstName?: string | null;
    lastName?: string | null;
    jobTitle?: string | null;
    email?: string | null;
    teams?: Array<{ teamName: string }> | null;
    managers?: Array<{
      firstName?: string | null;
      lastName?: string | null;
      isPrimaryManager?: boolean;
    }> | null;
  }
): string => {
  return translateAria(
    [isPendingInvitation ? "peopleTableRowPending" : "peopleTableRow"],
    {
      name: `${employee?.firstName || ""} ${employee?.lastName || ""}`,
      jobTitle: employee?.jobTitle
        ? employee?.jobTitle
        : translateAria(["null"]),
      email: employee?.email || "",
      teams:
        employee?.teams && employee.teams.length > 0
          ? employee.teams.map((team) => team.teamName).join(", ")
          : translateAria(["null"]),
      supervisor:
        employee?.managers && employee.managers.length > 0
          ? employee?.managers
              ?.map(
                (manager) =>
                  `${manager.firstName || ""} ${manager.lastName || ""}`
              )
              .join(", ")
          : translateAria(["null"])
    }
  );
};
