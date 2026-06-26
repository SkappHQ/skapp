import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { AttendanceStore } from "../types/attendanceStoreTypes";
import attendanceSlice from "./slices/attendanceSlice";
import { clockInSummarySlice } from "./slices/clockInSummarySlice";
import employeeTimesheetFilterSlice from "./slices/employeeTimesheetFilterSlice";
import { employeeTimesheetModalSlice } from "./slices/employeeTimesheetModalSlice";
import managerTimesheetFiltersSlice from "./slices/managerTimesheetFiltersSlice";

export const useAttendanceStore = create<
  AttendanceStore,
  [["zustand/devtools", never], ["zustand/persist", AttendanceStore]]
>(
  devtools(
    (set) => ({
      ...managerTimesheetFiltersSlice(set),
      ...attendanceSlice(set),
      ...employeeTimesheetModalSlice(set),
      ...employeeTimesheetFilterSlice(set),
      ...clockInSummarySlice(set)
    }),
    { name: "attendanceStore" }
  )
);
