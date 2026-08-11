import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Modules } from "~community/common/enums/CommonEnums";

import { ConfigurationStoreTypes } from "../types/zustand/StoreTypes";
import DealStageSlice from "./slices/dealStageSlice";

export const useConfigurationStore = create<
  ConfigurationStoreTypes,
  [["zustand/devtools", never], ["zustand/persist", ConfigurationStoreTypes]]
>(
  devtools(
    (set) => ({
      isUserRoleModalOpen: false,
      moduleType: Modules.NONE,
      isPeopleWorkspaceSaveTriggered: false,
      isPeopleWorkspaceResetTriggered: false,
      isPeopleWorkspaceDirty: false,
      isPeopleWorkspaceSubmitting: false,
      setIsUserRoleModalOpen: (status: boolean) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          isUserRoleModalOpen: status
        })),
      setModuleType: (moduleType: Modules) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          moduleType: moduleType
        })),
      setIsPeopleWorkspaceSaveTriggered: (isTriggered: boolean) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          isPeopleWorkspaceSaveTriggered: isTriggered
        })),
      setIsPeopleWorkspaceResetTriggered: (isTriggered: boolean) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          isPeopleWorkspaceResetTriggered: isTriggered
        })),
      setIsPeopleWorkspaceDirty: (isDirty: boolean) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          isPeopleWorkspaceDirty: isDirty
        })),
      setIsPeopleWorkspaceSubmitting: (isSubmitting: boolean) =>
        set((state: ConfigurationStoreTypes) => ({
          ...state,
          isPeopleWorkspaceSubmitting: isSubmitting
        })),
      ...DealStageSlice(set)
    }),
    { name: "configurationStore" }
  )
);
