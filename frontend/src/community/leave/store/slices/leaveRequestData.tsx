import { SetType } from "~community/common/types/storeTypes";
import { leaveRequestRowDataTypes } from "~community/leave/types/LeaveRequestTypes";
import {
  LeaveRequestDataSliceTypes,
  LeaveRequestModalSliceTypes,
  NewLeaveIdSliceTypes
} from "~community/leave/types/SliceTypes";

const leaveRequestData: leaveRequestRowDataTypes = {
  leaveId: null,
  empId: null,
  empName: "",
  avatarUrl: "",
  dates: "",
  days: "",
  reason: "",
  reviewerComment: "",
  status: "",
  leaveType: "",
  leaveEmoji: "",
  startDate: "",
  endDate: "",
  reviewedDate: "",
  creationDate: "",
  reviewer: {
    employeeId: "",
    designation: "",
    authPic: "",
    firstName: "",
    lastName: "",
    name: null,
    permission: null,
    email: null
  },
  attachments: [],
  managerType: ""
};
export const leaveRequestSDataSlice = (
  set: SetType<LeaveRequestDataSliceTypes>
): LeaveRequestDataSliceTypes => ({
  leaveRequestData,
  setLeaveRequestData: (value: leaveRequestRowDataTypes) =>
    set((state: LeaveRequestDataSliceTypes) => ({
      ...state,
      leaveRequestData: { ...value }
    })),
  removeLeaveRequestRowData: () =>
    set((state: LeaveRequestDataSliceTypes) => ({ ...state, leaveRequestData }))
});

export const leaveRequestModalSlice = (
  set: SetType<LeaveRequestModalSliceTypes>
): LeaveRequestModalSliceTypes => ({
  isManagerModalOpen: false,
  isEmployeeModalOpen: false,
  setIsManagerModal: (value: boolean) =>
    set((state: LeaveRequestModalSliceTypes) => ({
      ...state,
      isManagerModalOpen: value
    })),
  setIsEmployeeModal: (value: boolean) =>
    set((state: LeaveRequestModalSliceTypes) => ({
      ...state,
      isEmployeeModalOpen: value
    }))
});

export const newLeaveIdSlice = (
  set: SetType<NewLeaveIdSliceTypes>
): NewLeaveIdSliceTypes => ({
  newLeaveId: null,
  setNewLeaveId: (value: number) =>
    set((state: NewLeaveIdSliceTypes) => ({ ...state, newLeaveId: value })),
  removeNewLeaveId: () =>
    set((state: NewLeaveIdSliceTypes) => ({ ...state, newLeaveId: null }))
});
