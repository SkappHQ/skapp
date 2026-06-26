import { create } from "zustand";

import { TeamModelTypes } from "~community/people/types/TeamTypes";

import { teamSlice } from "./teamSlice";

describe("teamSlice", () => {
  it("should set isTeamModalOpen correctly", () => {
    const useStore = create(teamSlice);
    const { setIsTeamModalOpen } = useStore.getState();

    setIsTeamModalOpen(true);
    expect(useStore.getState().isTeamModalOpen).toBe(true);

    setIsTeamModalOpen(false);
    expect(useStore.getState().isTeamModalOpen).toBe(false);
  });

  it("should set teamModalType correctly", () => {
    const useStore = create(teamSlice);
    const { setTeamModalType } = useStore.getState();

    setTeamModalType(TeamModelTypes.ADD_TEAM);
    expect(useStore.getState().teamModalType).toBe(TeamModelTypes.ADD_TEAM);

    setTeamModalType(TeamModelTypes.NONE);
    expect(useStore.getState().teamModalType).toBe(TeamModelTypes.NONE);
  });

  it("should set currentEditingTeam correctly", () => {
    const useStore = create(teamSlice);
    const { setCurrentEditingTeam } = useStore.getState();

    const mockTeam = { id: 1, name: "Team A" };
    setCurrentEditingTeam(mockTeam);
    expect(useStore.getState().currentEditingTeam).toEqual(mockTeam);

    setCurrentEditingTeam(undefined);
    expect(useStore.getState().currentEditingTeam).toBeUndefined();
  });

  it("should set currentDeletingTeam correctly", () => {
    const useStore = create(teamSlice);
    const { setCurrentDeletingTeam } = useStore.getState();

    const mockTeam = { id: 2, name: "Team B" };
    setCurrentDeletingTeam(mockTeam);
    expect(useStore.getState().currentDeletingTeam).toEqual(mockTeam);

    setCurrentDeletingTeam(undefined);
    expect(useStore.getState().currentDeletingTeam).toBeUndefined();
  });
});
