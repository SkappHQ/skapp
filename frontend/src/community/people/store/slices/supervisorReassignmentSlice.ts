import { SetType } from "~community/common/types/storeTypes";

interface SupervisorReassignmentSliceType {
  isSupervisorReassignmentModalOpen: boolean;
  supervisorReassignmentActionType: "terminate" | "delete";
  setIsSupervisorReassignmentModalOpen: (value: boolean) => void;
  setSupervisorReassignmentActionType: (value: "terminate" | "delete") => void;
}

export const supervisorReassignmentSlice = (
  set: SetType<SupervisorReassignmentSliceType>
): SupervisorReassignmentSliceType => ({
  isSupervisorReassignmentModalOpen: false,
  supervisorReassignmentActionType: "terminate",
  setIsSupervisorReassignmentModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isSupervisorReassignmentModalOpen: value
    })),
  setSupervisorReassignmentActionType: (value: "terminate" | "delete") =>
    set((state) => ({
      ...state,
      supervisorReassignmentActionType: value
    }))
});

export type { SupervisorReassignmentSliceType };
