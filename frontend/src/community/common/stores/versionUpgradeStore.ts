import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { VersionUpgradeSliceTypes } from "../types/zustand/slices/VersionUpgradeSliceType";
import { versionUpgradeSlice } from "./slices/versionUpgradeSlice";

export const useVersionUpgradeStore = create<VersionUpgradeSliceTypes>()(
  persist(
    devtools((set) => ({
      ...versionUpgradeSlice(set)
    })),
    {
      name: "version-upgrade-storage"
    }
  )
);
