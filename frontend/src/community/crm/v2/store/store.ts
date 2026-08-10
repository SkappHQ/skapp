import { CrmCompaniesSlice } from "./slices/crmCompaniesSlice";
import { CrmContactsSlice } from "./slices/crmContactsSlice";
import { CrmDealsSlice } from "./slices/crmDealsSlice";
import { CrmLookupSlice } from "./slices/crmLookupSlice";
import { CrmTasksSlice } from "./slices/crmTasksSlice";
import { CrmUiSlice } from "./slices/crmUiSlice";

export type CrmStore = CrmCompaniesSlice &
  CrmContactsSlice &
  CrmDealsSlice &
  CrmTasksSlice &
  CrmLookupSlice &
  CrmUiSlice;
