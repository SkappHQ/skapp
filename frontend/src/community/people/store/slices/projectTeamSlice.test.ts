import { create } from "zustand";

import { ProjectTeamsModalTypes } from "~community/people/types/TeamTypes";

import {
  projectTeamModalSlice,
  projectTeamSearchSlice
} from "./projectTeamSlice";

describe("projectTeamModalSlice", () => {
  it("should set isProjectTeamsModalOpen correctly", () => {
    const useStore = create(projectTeamModalSlice);
    const { setProjectTeamsModalOpen } = useStore.getState();

    setProjectTeamsModalOpen(true);
    expect(useStore.getState().isProjectTeamsModalOpen).toBe(true);

    setProjectTeamsModalOpen(false);
    expect(useStore.getState().isProjectTeamsModalOpen).toBe(false);
  });

  it("should set projectTeamModalType correctly", () => {
    const useStore = create(projectTeamModalSlice);
    const { setProjectTeamModalType } = useStore.getState();

    setProjectTeamModalType(ProjectTeamsModalTypes.ADD_TEAM);
    expect(useStore.getState().projectTeamModalType).toBe(
      ProjectTeamsModalTypes.ADD_TEAM
    );

    setProjectTeamModalType(ProjectTeamsModalTypes.NONE);
    expect(useStore.getState().projectTeamModalType).toBe(
      ProjectTeamsModalTypes.NONE
    );
  });
});

describe("projectTeamSearchSlice", () => {
  it("should set projectTeamSearchTerm correctly", () => {
    const useStore = create(projectTeamSearchSlice);
    const { setProjectTeamSearchTerm } = useStore.getState();

    setProjectTeamSearchTerm("Engineering");
    expect(useStore.getState().projectTeamSearchTerm).toBe("Engineering");
  });

  it("should set projectTeams correctly", () => {
    const useStore = create(projectTeamSearchSlice);
    const { setProjectTeams } = useStore.getState();

    const mockTeams = [{ id: 1, name: "Team A" }];
    setProjectTeams(mockTeams);
    expect(useStore.getState().projectTeams).toEqual(mockTeams);
  });

  it("should set projectTeamNames correctly", () => {
    const useStore = create(projectTeamSearchSlice);
    const { setProjectTeamNames } = useStore.getState();

    const mockTeamNames = [{ id: 1, name: "Team A" }];
    setProjectTeamNames(mockTeamNames);
    expect(useStore.getState().projectTeamNames).toEqual(mockTeamNames);
  });

  it("should set projectTeamsAndEmployees correctly", () => {
    const useStore = create(projectTeamSearchSlice);
    const { setProjectTeamsAndEmployees } = useStore.getState();

    const mockTeamsAndEmployees = [{ teamId: 1, employees: [] }];
    setProjectTeamsAndEmployees(mockTeamsAndEmployees);
    expect(useStore.getState().projectTeamsAndEmployees).toEqual(
      mockTeamsAndEmployees
    );
  });

  it("should set addedTeams correctly", () => {
    const useStore = create(projectTeamSearchSlice);
    const { setAddedTeams } = useStore.getState();

    const mockAddedTeams = [{ name: "Team A", teamId: "1" }];
    setAddedTeams(mockAddedTeams);
    expect(useStore.getState().addedTeams).toEqual(mockAddedTeams);
  });
});
