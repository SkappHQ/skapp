import { SetType } from "~community/common/types/storeTypes";
import { leaveTypeColors } from "~community/leave/constants/configs";
import {
  LeaveDurationTypes,
  LeaveTypeModalEnums
} from "~community/leave/enums/LeaveTypeEnums";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import { calculationType } from "~community/leave/types/LeaveCarryForwardTypes";
import { LeaveTypeSliceType } from "~community/leave/types/SliceTypes";

const initialLeaveType: LeaveTypeType = {
  typeId: 0,
  name: "",
  emojiCode: "",
  colorCode: leaveTypeColors[0],
  calculationType: calculationType.ACCUMULATED,
  leaveDuration: LeaveDurationTypes.NONE,
  maxCarryForwardDays: undefined,
  carryForwardExpirationDays: 0,
  carryForwardExpirationDate: null,
  isAttachment: false,
  isOverridden: false,
  isAttachmentMandatory: false,
  isCommentMandatory: false,
  isAutoApproval: false,
  isActive: true,
  isCarryForwardEnabled: false,
  isCarryForwardRemainingBalanceEnabled: false
};

export const leaveTypeSlice = (
  set: SetType<LeaveTypeSliceType>
): LeaveTypeSliceType => ({
  allLeaveTypes: [],
  isLeaveTypeModalOpen: false,
  leaveTypeModalType: LeaveTypeModalEnums.NONE,
  editingLeaveType: initialLeaveType,
  isLeaveTypeFormDirty: false,
  pendingNavigation: "",
  setAllLeaveTypes: (leaveTypes: LeaveTypeType[]) =>
    set((state) => ({
      ...state,
      allLeaveTypes: leaveTypes
    })),
  setIsLeaveTypeModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isLeaveTypeModalOpen: value
    })),
  setLeaveTypeModalType: (status: LeaveTypeModalEnums) =>
    set((state: LeaveTypeSliceType) => {
      if (status === LeaveTypeModalEnums.NONE) {
        return {
          ...state,
          isLeaveTypeModalOpen: false,
          leaveTypeModalType: status,
          pendingNavigation: ""
        };
      }

      return {
        ...state,
        isLeaveTypeModalOpen: true,
        leaveTypeModalType: status
      };
    }),
  setEditingLeaveType: (leaveType: LeaveTypeType) =>
    set((state) => ({
      ...state,
      editingLeaveType: leaveType
    })),
  setPendingNavigation: (value: string) =>
    set((state) => ({
      ...state,
      pendingNavigation: value
    })),
  setLeaveTypeFormDirty: (value: boolean) =>
    set((state) => ({
      ...state,
      isLeaveTypeFormDirty: value
    })),
  resetEditingLeaveType: () =>
    set((state) => ({
      ...state,
      editingLeaveType: initialLeaveType,
      isLeaveTypeFormDirty: false,
      pendingNavigation: ""
    }))
});
