export interface GoogleWorkspaceSyncUser {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  status?: string;
  changeType?: "NEW" | "UPDATED";
}

export interface GoogleWorkspaceSyncResult {
  newAccounts: GoogleWorkspaceSyncUser[];
  suspendedAccounts: GoogleWorkspaceSyncUser[];
  totalSynced: number;
  totalAdded: number;
  totalSuspended: number;
  syncedAt: string;
  syncStatus: "success" | "error" | "pending";
  message?: string;
}

export interface GoogleWorkspaceSyncResponse {
  data: GoogleWorkspaceSyncResult;
  message: string;
  success: boolean;
}

export interface StagingRecord {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  googleStatus: "ACTIVE" | "SUSPENDED";
  changeType: "NEW" | "UPDATED" | "REMOVED";
  decision: "PENDING" | "APPROVED" | "REJECTED";
  syncedAt: string;
}
