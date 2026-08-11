import { CrmDataSlice } from "./slices/crmDataSlice";
import { CrmUiSlice } from "./slices/crmUiSlice";

export type CrmStore = CrmDataSlice & CrmUiSlice;
