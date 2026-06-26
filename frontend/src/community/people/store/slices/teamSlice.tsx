import { SetType } from "~community/common/types/storeTypes";
import { TeamSliceType } from "~community/people/types/SliceTypes";
import { TeamModelTypes, TeamType } from "~community/people/types/TeamTypes";

export const teamSlice = (set: SetType<TeamSliceType>): TeamSliceType => ({
  isTeamModalOpen: false,
  teamModalType: TeamModelTypes.NONE,
  currentEditingTeam: undefined,
  currentDeletingTeam: undefined,
  setIsTeamModalOpen: (status: boolean) =>
    set(() => ({ isTeamModalOpen: status })),
  setTeamModalType: (modalType: TeamModelTypes) =>
    set(() => ({ teamModalType: modalType })),
  setCurrentEditingTeam: (team: TeamType | undefined) =>
    set(() => ({ currentEditingTeam: team })),
  setCurrentDeletingTeam: (team: TeamType | undefined) =>
    set(() => ({ currentDeletingTeam: team }))
});
