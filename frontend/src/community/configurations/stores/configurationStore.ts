import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Modules } from "~community/common/enums/CommonEnums";

import { ConfigurationStoreTypes } from "../types/zustand/StoreTypes";

export const useConfigurationStore = create<
  ConfigurationStoreTypes,
  [["zustand/devtools", never], ["zustand/persist", ConfigurationStoreTypes]]
>(
  devtools(
    (set) => ({
      isUserRoleModalOpen: false,
      moduleType: Modules.NONE,
      setIsUserRoleModalOpen: (status: boolean) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          isUserRoleModalOpen: status
        })),
      setModuleType: (moduleType: Modules) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          moduleType: moduleType
        }))
    }),
    { name: "configurationStore" }
  )
);
