export interface GoogleConnectionStatusResponse {
  isConnected?: boolean;
  connectedByEmail?: string;
  connectedAt?: string;
  autoSyncEnabled?: boolean;
  isSyncNotificationsEnabled?: boolean;
}
