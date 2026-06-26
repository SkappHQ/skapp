import { ManagerTypes } from "~community/common/types/CommonTypes";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";
import { FilterButtonTypes } from "~community/common/types/filterTypes";
import { SystemPermissionInitialStateType } from "~community/people/types/AddNewResourceTypes";
import {
  EmployeeDetails,
  EmployeeManagerType,
  Role,
  TeamType
} from "~community/people/types/EmployeeTypes";
import { AllJobFamilyType } from "~community/people/types/JobFamilyTypes";

import { EmployeeDataTeamType } from "../types/PeopleTypes";

export const sortSupervisorAvatars = (
  avatars: Array<AvatarPropTypes>
): Array<AvatarPropTypes> =>
  avatars
    ?.sort((a) => (a.managerType === ManagerTypes.SECONDARY ? -1 : 1))
    .sort((a) => (a.primaryManager ? -1 : 1))
    .sort((a, b) =>
      a.managerType === b.managerType
        ? (a.firstName ?? "") > (b.firstName ?? "")
          ? 1
          : -1
        : 0
    );

export const refactorSupervisorAvatars = (
  supervisors: EmployeeManagerType[]
): Array<AvatarPropTypes> =>
  supervisors?.map((supervisor: EmployeeManagerType) => ({
    image: supervisor?.manager?.authPic ?? "",
    firstName: supervisor?.manager?.firstName ?? "",
    lastName: supervisor?.manager?.lastName ?? "",
    primaryManager: supervisor?.isPrimaryManager,
    managerType: supervisor?.managerType
  }));

export const refactorTeamListData = (
  team: EmployeeDataTeamType[]
): {
  firstTeamName: string;
  otherTeamCount: number;
} => {
  const sortedTeams = team?.sort((a, b) => a.teamId - b.teamId);
  return {
    firstTeamName: sortedTeams?.[0]?.teamName,
    otherTeamCount: team?.length - 1
  };
};

export function GetTeamPreProcessor(teamList: TeamType[]): FilterButtonTypes[] {
  const preProcessedData = teamList?.map((team: TeamType) => {
    return {
      id: String(team.teamId),
      text: team.teamName
    };
  });
  return preProcessedData;
}

export function GetFamilyFilterPreProcessor(
  jobFamilyList: AllJobFamilyType[]
): FilterButtonTypes[] {
  const preProcessedData = jobFamilyList?.map((jobFamily: AllJobFamilyType) => {
    return {
      id: jobFamily?.jobFamilyId,
      text: jobFamily?.name
    };
  });

  return preProcessedData;
}

export const isDemoteUser = (
  employee: EmployeeDetails | undefined,
  values: SystemPermissionInitialStateType
): boolean => {
  if (!employee || !employee.userRoles) {
    return false;
  }

  const {
    peopleRole: oldPeopleRole,
    leaveRole: oldLeaveRole,
    attendanceRole: oldAttendanceRole
  } = employee.userRoles;
  const {
    peopleRole: newPeopleRole,
    leaveRole: newLeaveRole,
    attendanceRole: newAttendanceRole
  } = values;

  const isPeopleDemoted =
    (oldPeopleRole === Role.PEOPLE_ADMIN ||
      oldPeopleRole === Role.PEOPLE_MANAGER) &&
    newPeopleRole === Role.PEOPLE_EMPLOYEE;

  const isLeaveDemoted =
    (oldLeaveRole === Role.LEAVE_ADMIN ||
      oldLeaveRole === Role.LEAVE_MANAGER) &&
    newLeaveRole === Role.LEAVE_EMPLOYEE;

  const isAttendanceDemoted =
    (oldAttendanceRole === Role.ATTENDANCE_ADMIN ||
      oldAttendanceRole === Role.ATTENDANCE_MANAGER) &&
    newAttendanceRole === Role.ATTENDANCE_EMPLOYEE;

  return isPeopleDemoted || isLeaveDemoted || isAttendanceDemoted;
};
