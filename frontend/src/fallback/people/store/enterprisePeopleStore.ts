interface EnterprisePeopleStore {
  hasNavigatedFromSync: boolean;
  selectedIds: number[];
  isSelectAllActive: boolean;
  setHasNavigatedFromSync: (value: boolean) => void;
  setSelectedIds: (ids: number[]) => void;
  setIsSelectAllActive: (value: boolean) => void;
  resetSelection: () => void;
  isPeopleWorkspaceSaveTriggered: boolean;
  isPeopleWorkspaceResetTriggered: boolean;
  isPeopleWorkspaceDirty: boolean;
  isPeopleWorkspaceSubmitting: boolean;
  setIsPeopleWorkspaceSaveTriggered: (isTriggered: boolean) => void;
  setIsPeopleWorkspaceResetTriggered: (isTriggered: boolean) => void;
  setIsPeopleWorkspaceDirty: (isDirty: boolean) => void;
  setIsPeopleWorkspaceSubmitting: (isSubmitting: boolean) => void;
}

export const useEnterprisePeopleStore = (
  arg0: (state: any) => any
): EnterprisePeopleStore => {
  return {
    hasNavigatedFromSync: false,
    selectedIds: [],
    isSelectAllActive: true,
    setHasNavigatedFromSync: () => {},
    setSelectedIds: () => {},
    setIsSelectAllActive: () => {},
    resetSelection: () => {},
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
