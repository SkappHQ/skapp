import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { jobFamilySlice } from "~community/people/store/slices/jobFamilySlice";
import { teamSlice } from "~community/people/store/slices/teamSlice";
import { Store } from "~community/people/types/StoreTypes";

import { employeeDetailsSlice } from "./slices/addNewEmployeeSlice";
import { addNewCalenderModalSlice } from "./slices/calendarModalSlice";
import { directoryModalSlice } from "./slices/directoryModalSlice";
import { employeeDataFiltersSlice } from "./slices/employeeDataFiltersSlice";
import holidayDataFiltersSlice from "./slices/holidayDataFilterSlice";
import { holidayModalSlice } from "./slices/holidayModalSlice";
import holidaySlice from "./slices/holidaySlice";
import peopleSlice from "./slices/peopleSlice";
import {
  projectTeamModalSlice,
  projectTeamSearchSlice
} from "./slices/projectTeamSlice";
import { supervisorReassignmentSlice } from "./slices/supervisorReassignmentSlice";
import { terminationConfirmationModalSlice } from "./slices/terminateEmployeeSlice";
import { terminationAlertModalSlice } from "./slices/terminationAlertSlice";
import { userDeletionModalSlice } from "./slices/userDeletionSlice";

export const usePeopleStore = create<
  Store,
  [["zustand/devtools", never], ["zustand/persist", Store]]
>(
  devtools(
    (set) => ({
      ...teamSlice(set),
      ...jobFamilySlice(set),
      ...holidayDataFiltersSlice(set),
      ...holidaySlice(set),
      ...holidayModalSlice(set),
      ...addNewCalenderModalSlice(set),
      ...employeeDataFiltersSlice(set),
      ...directoryModalSlice(set),
      ...employeeDetailsSlice(set),
      ...projectTeamModalSlice(set),
      ...projectTeamSearchSlice(set),
      ...terminationConfirmationModalSlice(set),
      ...terminationAlertModalSlice(set),
      ...userDeletionModalSlice(set),
      ...supervisorReassignmentSlice(set),
      ...peopleSlice(set)
    }),
    { name: "peopleStore" }
  )
);
