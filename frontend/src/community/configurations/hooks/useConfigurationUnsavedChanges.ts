import { useEffect } from "react";

import { useConfigurationStore } from "~community/configurations/stores/configurationStore";

const useConfigurationUnsavedChanges = (hasUnsavedChanges: boolean): void => {
  const setHasUnsavedChanges = useConfigurationStore(
    (state) => state.setHasUnsavedChanges
  );

  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges);
    return () => setHasUnsavedChanges(false);
  }, [hasUnsavedChanges]);
};

export default useConfigurationUnsavedChanges;
