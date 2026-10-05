import { useEffect } from "react";

import { useConfigurationStore } from "~community/configurations/stores/configurationStore";

const useConfigurationUnsavedChanges = (hasUnsavedChanges: boolean): void => {
  const setHasUnsavedChanges = useConfigurationStore(
    (state) => state.setHasUnsavedChanges
  );

  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  useEffect(() => () => setHasUnsavedChanges(false), []);
};

export default useConfigurationUnsavedChanges;
