import { SetType } from "~community/common/types/storeTypes";
import { LeaveRequestDataType } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { EmployeeLeaveRequestDataSliceTypes } from "~community/leave/types/SliceTypes";

const employeeLeaveRequestData: LeaveRequestDataType = {
  leaveRequestId: 0,
  startDate: "",
  endDate: "",
  leaveType: {
    typeId: 0,
    name: "",
    emojiCode: "",
    colorCode: ""
  },
  leaveState: "",
  status: "",
  durationHours: 0,
  isViewed: null,
  durationDays: 0,
  requestDesc: ""
};

export const employeeLeaveRequestDataSlice = (
  set: SetType<EmployeeLeaveRequestDataSliceTypes>
): EmployeeLeaveRequestDataSliceTypes => ({
  employeeLeaveRequestData,
  setEmployeeLeaveRequestData: (value: LeaveRequestDataType) =>
    set((state: EmployeeLeaveRequestDataSliceTypes) => ({
      ...state,
      employeeLeaveRequestData: { ...value }
    })),
  removeEmployeeLeaveRequestData: () =>
    set((state: EmployeeLeaveRequestDataSliceTypes) => ({
      ...state,
      employeeLeaveRequestData
    }))
});
