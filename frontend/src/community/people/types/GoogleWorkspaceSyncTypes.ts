export enum StagingChangeType {
  NEW = "NEW",
  UPDATED = "UPDATED",
  REMOVED = "REMOVED"
}

export enum GoogleAccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}

export enum StagingDecision {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface StagingRecord {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  googleStatus: GoogleAccountStatus | string;
  changeType: StagingChangeType;
  decision: StagingDecision | string;
  syncedAt: string;
  photoUrl?: string;
  orgUnitPath?: string;
}

export interface GoogleConnectionStatus {
  connected: boolean;
  connectedByEmail?: string;
  connectedAt?: string;
}

export interface LastSyncChangesEntry {
  changes: StagingRecord[];
  syncedAt: string;
}
