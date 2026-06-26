import { SetType } from "~community/common/types/storeTypes";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType
} from "~community/leave/types/CustomLeaveAllocationTypes";
import { LeaveAllocationModalSliceType } from "~community/leave/types/SliceTypes";

export const leaveAllocationSlice = (
  set: SetType<LeaveAllocationModalSliceType>
): LeaveAllocationModalSliceType => ({
  isLeaveAllocationModalOpen: false,
  customLeaveAllocationModalType: CustomLeaveAllocationModalTypes.NONE,
  currentEditingLeaveAllocation: undefined,
  currentDeletingLeaveAllocation: undefined,
  leaveDays: 0,
  leaveType: "",
  effectiveDate: undefined,
  expirationDate: undefined,
  currentPage: 0,
  customLeaveAllocations: [],

  setIsLeaveAllocationModalOpen: (status: boolean) =>
    set((state) => ({ ...state, isLeaveAllocationModalOpen: status })),
  setCustomLeaveAllocationModalType: (
    modalType: CustomLeaveAllocationModalTypes
  ) =>
    set((state) => ({ ...state, customLeaveAllocationModalType: modalType })),
  setCurrentEditingLeaveAllocation: (
    leaveAllocation: CustomLeaveAllocationType | undefined
  ) =>
    set((state) => ({
      ...state,
      currentEditingLeaveAllocation: leaveAllocation
    })),
  setCurrentDeletingLeaveAllocation: (
    leaveAllocation: CustomLeaveAllocationType | undefined
  ) =>
    set((state) => ({
      ...state,
      currentDeletingLeaveAllocation: leaveAllocation
    })),
  setLeaveDays: (days: number) =>
    set((state) => ({ ...state, leaveDays: days })),
  setLeaveType: (type: string) =>
    set((state) => ({ ...state, leaveType: type })),
  setEffectiveDate: (date: Date | undefined) =>
    set((state) => ({ ...state, effectiveDate: date })),
  setExpirationDate: (date: Date | undefined) =>
    set((state) => ({ ...state, expirationDate: date })),
  setCurrentPage: (page: number) =>
    set((state) => ({ ...state, currentPage: page })),
  setCustomLeaveAllocations: (allocations: CustomLeaveAllocationType[]) =>
    set((state) => ({ ...state, customLeaveAllocations: allocations }))
});
