import { SetType } from "~community/common/types/storeTypes";
import { EmployeeRemoveAction } from "~community/people/types/PeopleTypes";

interface SupervisorReassignmentSliceType {
  isSupervisorReassignmentModalOpen: boolean;
  supervisorReassignmentActionType: EmployeeRemoveAction;
  setIsSupervisorReassignmentModalOpen: (value: boolean) => void;
  setSupervisorReassignmentActionType: (value: EmployeeRemoveAction) => void;
}

export const supervisorReassignmentSlice = (
  set: SetType<SupervisorReassignmentSliceType>
): SupervisorReassignmentSliceType => ({
  isSupervisorReassignmentModalOpen: false,
  supervisorReassignmentActionType: EmployeeRemoveAction.TERMINATE,
  setIsSupervisorReassignmentModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isSupervisorReassignmentModalOpen: value
    })),
  setSupervisorReassignmentActionType: (value: EmployeeRemoveAction) =>
    set((state) => ({
      ...state,
      supervisorReassignmentActionType: value
    }))
});

export type { SupervisorReassignmentSliceType };
