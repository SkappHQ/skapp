interface GoogleWorkspaceSyncSettingsStore {
  isPeopleWorkspaceSaveTriggered: boolean;
  isPeopleWorkspaceResetTriggered: boolean;
  isPeopleWorkspaceDirty: boolean;
  isPeopleWorkspaceSubmitting: boolean;
  setIsPeopleWorkspaceSaveTriggered: (isTriggered: boolean) => void;
  setIsPeopleWorkspaceResetTriggered: (isTriggered: boolean) => void;
  setIsPeopleWorkspaceDirty: (isDirty: boolean) => void;
  setIsPeopleWorkspaceSubmitting: (isSubmitting: boolean) => void;
}

export const useGoogleWorkspaceSyncSettingsStore = (
  arg0: (state: any) => any
): GoogleWorkspaceSyncSettingsStore => {
  return {
    isPeopleWorkspaceSaveTriggered: false,
    isPeopleWorkspaceResetTriggered: false,
    isPeopleWorkspaceDirty: false,
    isPeopleWorkspaceSubmitting: false,
    setIsPeopleWorkspaceSaveTriggered: () => {},
    setIsPeopleWorkspaceResetTriggered: () => {},
    setIsPeopleWorkspaceDirty: () => {},
    setIsPeopleWorkspaceSubmitting: () => {}
  };
};
