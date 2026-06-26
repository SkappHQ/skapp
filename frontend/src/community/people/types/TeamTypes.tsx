import { ManagerTeamType } from "~community/common/types/CommonTypes";

import { EmployeeDataType, EmployeeType } from "./EmployeeTypes";

export interface TeamDetailsType {
  teamId: string | number;
  teamName: string;
  supervisors?: EmployeeDataType[] | number[];
  teamMembers?: EmployeeDataType[] | number[];
  teamLeads?: EmployeeDataType[] | number[];
}

export interface TeamResponseType {
  teamId: number;
  teamName: string;
  employees: {
    employee: EmployeeType;
    isSupervisor: boolean;
  }[];
}

export interface TeamType {
  teamId: string | number;
  teamName: string;
  supervisors: EmployeeType[];
  teamMembers: EmployeeType[];
}

export enum TeamModelTypes {
  ADD_TEAM = "ADD_TEAM",
  UNSAVED_ADD_TEAM = "UNSAVED_ADD_TEAM",
  EDIT_TEAM = "EDIT_TEAM",
  UNSAVED_EDIT_TEAM = "UNSAVED_EDIT_TEAM",
  CONFIRM_DELETE = "CONFIRM_DELETE",
  REASSIGN_MEMBERS = "REASSIGN_MEMBERS",
  TEAM_ACTIONS = "TEAM_ACTIONS",
  NONE = "NONE"
}

export interface AddTeamType {
  teamId?: number;
  teamName: string;
  teamMembers: EmployeeDataType[];
  teamSupervisors: EmployeeDataType[];
}

export enum ProjectTeamsModalTypes {
  EDIT_TEAM = "Edit Team",
  DELETE_TEAM = "Delete Team",
  ADD_TEAM = "Add Team",
  ADD_TEAM_SUCCESS = "Add team success",
  EDIT_TEAM_SUCCESS = "Edit team success",
  DELETE_TEAM_SUCCESS = "Delete team success",
  ABANDON_EDIT_FLOW = "Abandon edit flow",
  ABANDON_ADD_FLOW = "Abandon add flow",
  REASSIGN_MEMBERS = "Reassign Members",
  NONE = ""
}

export interface ProjectTeamsAndEmployeesType {
  teamId: string;
  name: string;
  employees:
    | Array<{
        firstName: string | null;
        lastName: string | null;
        image: string | null;
      }>
    | [];
}

export interface TeamNamesListType {
  team: {
    teamId: string;
    teamName: string;
  };
  teamName: string;
  teamMembers: EmployeeType[];
  teamSupervisors: EmployeeType[];
}

export interface UpdateTeamType {
  teamId: number;
  teamName: string;
  teamMembers: EmployeeDataType[];
  teamSupervisors: EmployeeDataType[];
}

export interface TeamMemberTypes {
  supervisor: EmployeeDataType[];
  members: EmployeeDataType[];
}

export interface TeamNamesType {
  teamId: string | number;
  teamName: string;
}

export interface GetManagerTeamsResponseType {
  managerTeams: ManagerTeamType[];
  page: number;
  totalItems: number;
  totalPages: number;
}
