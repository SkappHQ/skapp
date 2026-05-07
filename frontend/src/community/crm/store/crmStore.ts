import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CrmStore } from "../types/CrmStoreTypes";
import crmSlice from "./slices/crmSlice";

export const useCrmStore = create<
    CrmStore,
    [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
    devtools(
        (set) => ({
            ...crmSlice(set)
        }),
        { name: "crmStore" }
    )
);
