import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { leaveAllocationSlice } from "~community/leave/store/slices/leaveAllocationSlice";
import { leaveEntitlementSlice } from "~community/leave/store/slices/leaveEntitlementSlice";
import { leaveTypeSlice } from "~community/leave/store/slices/leaveTypeSlice";
import { myRequestSlice } from "~community/leave/store/slices/myRequestSlice";
import { LeaveStore } from "~community/leave/types/StoreTypes";

import { addNewEntitlementsSlice } from "./slices/addNewEntitlmentsSlice";
import { employeeLeaveRequestDataSlice } from "./slices/employeeLeaveRequestDataSlice";
import { leaveCarryForwardModalSlice } from "./slices/leaveCarryForwardModalSlice";
import {
  leaveRequestModalSlice,
  leaveRequestSDataSlice,
  newLeaveIdSlice
} from "./slices/leaveRequestData";
import leaveRequestFilterSlice from "./slices/leaveRequestFilterSlice";
import { newPendingLeaveCountSlice } from "./slices/newPendingLeaveCountSlice";
import { onLeaveModalSlice } from "./slices/onLeaveModalSlice";
import reportsFiltersSlice from "./slices/reportFilterSlice";
import teamLeaveAnalyticSlice from "./slices/teamLeaveAnalyticSlice";

export const useLeaveStore = create<
  LeaveStore,
  [["zustand/devtools", never], ["zustand/persist", LeaveStore]]
>(
  devtools(
    (set) => ({
      ...leaveCarryForwardModalSlice(set),
      ...addNewEntitlementsSlice(set),
      ...leaveTypeSlice(set),
      ...leaveAllocationSlice(set),
      ...leaveEntitlementSlice(set),
      ...myRequestSlice(set),
      ...reportsFiltersSlice(set),
      ...leaveRequestFilterSlice(set),
      ...leaveRequestSDataSlice(set),
      ...newLeaveIdSlice(set),
      ...leaveRequestModalSlice(set),
      ...employeeLeaveRequestDataSlice(set),
      ...teamLeaveAnalyticSlice(set),
      ...newPendingLeaveCountSlice(set),
      ...onLeaveModalSlice(set)
    }),
    { name: "leaveStore" }
  )
);
