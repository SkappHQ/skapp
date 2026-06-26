import { SetType } from "~community/common/types/storeTypes";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import { addNewEntitlementsSliceType } from "~community/leave/types/SliceTypes";

export const addNewEntitlementsSlice = (
  set: SetType<addNewEntitlementsSliceType>
): addNewEntitlementsSliceType => ({
  leaveTypes: [],
  carryForwardLeaveTypes: [],
  leaveCarryForwardId: [],
  carryForwardPagination: {
    year: new Date().getFullYear(),
    sortOrder: "ASC",
    page: 0,
    size: 6,
    leaveTypes: []
  },
  leaveCarryForwardModalData: {
    leaveCarryForwardId: [],
    carryForwardLeaveTypes: []
  },
  setLeaveTypes: (value: LeaveTypeType[]) =>
    set((state: addNewEntitlementsSliceType) => ({
      ...state,
      leaveTypes: value
    })),
  setCarryForwardLeaveTypes: (value: LeaveTypeType[]) =>
    set((state: addNewEntitlementsSliceType) => ({
      ...state,
      carryForwardLeaveTypes: value
    })),
  setLeaveCarryForwardId: (value: number[]) =>
    set((state: addNewEntitlementsSliceType) => ({
      ...state,
      leaveCarryForwardId: value
    })),
  setCarryForwardPagination: (page: number) => {
    set((state) => ({
      ...state,
      carryForwardPagination: {
        ...state.carryForwardPagination,
        page
      }
    }));
  },
  setLeaveCarryForwardModalData: (leaveCarryForwardId: number[]) =>
    set((state: addNewEntitlementsSliceType) => ({
      ...state,
      leaveCarryForwardModalData: {
        ...state.leaveCarryForwardModalData,
        leaveCarryForwardId
      }
    }))
});
