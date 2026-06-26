import { SetType } from "~community/common/types/storeTypes";
import {
  ProjectTeamModalSliceType,
  ProjectTeamSearchSliceType
} from "~community/people/types/SliceTypes";
import {
  ProjectTeamsAndEmployeesType,
  ProjectTeamsModalTypes,
  TeamDetailsType,
  TeamNamesType
} from "~community/people/types/TeamTypes";

const projectTeams: TeamDetailsType[] = [];
const projectTeamsAndEmployees: ProjectTeamsAndEmployeesType[] = [];
const addedTeams: Array<{ name: string; teamId: string }> = [];

export const projectTeamModalSlice = (
  set: SetType<ProjectTeamModalSliceType>
): ProjectTeamModalSliceType => ({
  isProjectTeamsModalOpen: false,
  projectTeamModalType: ProjectTeamsModalTypes.NONE,
  setProjectTeamsModalOpen: (value: boolean) =>
    set((state: ProjectTeamModalSliceType) => ({
      ...state,
      isProjectTeamsModalOpen: value
    })),
  setProjectTeamModalType: (value: ProjectTeamsModalTypes) =>
    set((state: ProjectTeamModalSliceType) => ({
      ...state,
      projectTeamModalType: value
    }))
});

export const projectTeamSearchSlice = (
  set: SetType<ProjectTeamSearchSliceType>
): ProjectTeamSearchSliceType => ({
  projectTeamSearchTerm: "",
  projectTeamNames: [],
  projectTeams,
  projectTeamsAndEmployees,
  addedTeams,
  setProjectTeamSearchTerm: (value: string) =>
    set((state: ProjectTeamSearchSliceType) => ({
      ...state,
      projectTeamSearchTerm: value
    })),
  setProjectTeams: (value: TeamDetailsType[]) =>
    set((state: ProjectTeamSearchSliceType) => ({
      ...state,
      projectTeams: value
    })),
  setProjectTeamNames: (value: TeamNamesType[]) =>
    set((state: ProjectTeamSearchSliceType) => ({
      ...state,
      projectTeamNames: value
    })),
  setProjectTeamsAndEmployees: (value: ProjectTeamsAndEmployeesType[]) =>
    set((state: ProjectTeamSearchSliceType) => ({
      ...state,
      projectTeamsAndEmployees: value
    })),
  setAddedTeams: (value: Array<{ name: string; teamId: string }>) =>
    set((state: ProjectTeamSearchSliceType) => ({
      ...state,
      addedTeams: value
    }))
});
