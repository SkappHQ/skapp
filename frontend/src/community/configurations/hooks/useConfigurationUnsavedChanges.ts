import { useEffect } from "react";

import { useConfigurationStore } from "~community/configurations/stores/configurationStore";

// Reports a configuration tab's unsaved state so the configurations page can
// warn before switching tabs. Cleared on unmount since the tab's edits are discarded.
const useConfigurationUnsavedChanges = (hasUnsavedChanges: boolean): void => {
  const setHasUnsavedChanges = useConfigurationStore(
    (state) => state.setHasUnsavedChanges
  );

  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges, setHasUnsavedChanges]);

  useEffect(() => {
    return () => setHasUnsavedChanges(false);
  }, [setHasUnsavedChanges]);
};

export default useConfigurationUnsavedChanges;
