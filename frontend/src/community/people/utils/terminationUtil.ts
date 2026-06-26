import { theme } from "~community/common/theme/theme";
import { AccountStatusEnums } from "~community/people/enums/DirectoryEnums";
import { EmployeeDetails } from "~community/people/types/EmployeeTypes";

export function getStatusStyle(status: AccountStatusEnums) {
  const statusStyles = {
    [AccountStatusEnums.ACTIVE.toUpperCase()]: {
      backgroundColor: theme.palette.greens.lighter,
      color: theme.palette.greens.deepShadows
    },
    [AccountStatusEnums.PENDING.toUpperCase()]: {
      backgroundColor: theme.palette.amber.mid,
      color: theme.palette.amber.chipText
    },
    [AccountStatusEnums.TERMINATED.toUpperCase()]: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.text.darkerText
    }
  };

  return statusStyles[status] || null;
}

export const findHasSupervisoryRoles = (employee: EmployeeDetails): boolean => {
  const hasTeamSupervisorRole = employee.teams.some(
    (team): boolean =>
      typeof team !== "number" && team.team?.isSupervisor === true
  );

  const isPrimaryManager = (employee.managers ?? []).some(
    (manager): boolean => manager?.isPrimaryManager === true
  );

  return hasTeamSupervisorRole || isPrimaryManager;
};
