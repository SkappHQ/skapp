import { AttendanceSliceType } from "~community/attendance/types/attendanceSliceTypes";
import {
  AttendanceSlotType,
  attendanceLeaveStatusTypes,
  attendanceStatusTypes
} from "~community/attendance/types/attendanceTypes";
import { SetType } from "~community/common/types/storeTypes";

const attendanceParams: attendanceStatusTypes = {
  slotType: AttendanceSlotType.READY,
  slotStartTime: null,
  breakHours: null,
  workHours: null
};

const attendanceLeaveStatus: attendanceLeaveStatusTypes = {
  onLeave: false,
  duration: null,
  date: null,
  leaveName: null,
  leaveIcon: null
};

const attendanceSlice = (
  set: SetType<AttendanceSliceType>
): AttendanceSliceType => ({
  attendanceParams: { ...attendanceParams },
  attendanceLeaveStatus: { ...attendanceLeaveStatus },
  isAttendanceModalOpen: false,
  isPreMidnightClockOutAlertOpen: false,
  isAutoClockOutMidnightModalOpen: false,

  setSlotType: (slotType: AttendanceSlotType) => {
    set((state: AttendanceSliceType) => ({
      ...state,
      attendanceParams: {
        ...state.attendanceParams,
        slotType
      }
    }));
    return slotType;
  },

  setAttendanceParams: (key: string, value: string) => {
    set((state: AttendanceSliceType) => {
      return {
        ...state,
        attendanceParams: {
          ...state.attendanceParams,
          [key]: value
        }
      };
    });
  },

  setAttendanceLeaveStatus: (key: string, value: string | boolean) => {
    set((state: AttendanceSliceType) => {
      return {
        ...state,
        attendanceLeaveStatus: {
          ...state.attendanceLeaveStatus,
          [key]: value
        }
      };
    });
  },

  setIsAttendanceModalOpen: (value: boolean) => {
    set((state: AttendanceSliceType) => ({
      ...state,
      isAttendanceModalOpen: value
    }));
  },

  setIsPreMidnightClockOutAlertOpen: (value: boolean) => {
    set((state: AttendanceSliceType) => ({
      ...state,
      isPreMidnightClockOutAlertOpen: value
    }));
  },

  setIsAutoClockOutMidnightModalOpen: (value: boolean) => {
    set((state: AttendanceSliceType) => ({
      ...state,
      isAutoClockOutMidnightModalOpen: value
    }));
  }
});

export default attendanceSlice;
