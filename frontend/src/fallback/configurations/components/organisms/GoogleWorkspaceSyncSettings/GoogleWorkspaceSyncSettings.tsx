import { MutableRefObject } from "react";

export interface GoogleWorkspaceSyncSettingsActions {
  save: () => Promise<boolean>;
  reset: () => void;
}

export interface GoogleWorkspaceSyncSettingsState {
  isDirty: boolean;
  isSubmitting: boolean;
}

interface GoogleWorkspaceSyncSettingsProps {
  actionsRef: MutableRefObject<GoogleWorkspaceSyncSettingsActions>;
  onStateChange: (state: GoogleWorkspaceSyncSettingsState) => void;
}

const GoogleWorkspaceSyncSettings = (_props: GoogleWorkspaceSyncSettingsProps) => {
  return null;
};

export default GoogleWorkspaceSyncSettings;
