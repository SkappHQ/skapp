import { SetType } from "~community/common/types/storeTypes";
import { SupervisorReassignmentActionType } from "~community/people/types/PeopleTypes";

interface SupervisorReassignmentSliceType {
  isSupervisorReassignmentModalOpen: boolean;
  supervisorReassignmentActionType: SupervisorReassignmentActionType;
  setIsSupervisorReassignmentModalOpen: (value: boolean) => void;
  setSupervisorReassignmentActionType: (
    value: SupervisorReassignmentActionType
  ) => void;
}

export const supervisorReassignmentSlice = (
  set: SetType<SupervisorReassignmentSliceType>
): SupervisorReassignmentSliceType => ({
  isSupervisorReassignmentModalOpen: false,
  supervisorReassignmentActionType: SupervisorReassignmentActionType.TERMINATE,
  setIsSupervisorReassignmentModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isSupervisorReassignmentModalOpen: value
    })),
  setSupervisorReassignmentActionType: (
    value: SupervisorReassignmentActionType
  ) =>
    set((state) => ({
      ...state,
      supervisorReassignmentActionType: value
    }))
});

export type { SupervisorReassignmentSliceType };
