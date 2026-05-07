import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CrmStore } from "../types/CrmStoreTypes";
import companyModalSlice from "./slices/companyModalSlice";
import crmContactsModalSlice from "./slices/crmContactsModalSlice";

export const useCrmStore = create<
    CrmStore,
    [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
    devtools(
        (set) => ({
            ...companyModalSlice(set),
            ...crmContactsModalSlice(set)
        }),
        { name: "crmStore" }
    )
);
