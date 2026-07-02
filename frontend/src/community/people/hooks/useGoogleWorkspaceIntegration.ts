import { useCallback, useEffect, useState } from "react";

import authFetch from "~community/common/utils/axiosInterceptor";
import { getApiUrl } from "~community/common/utils/getConstants";

export interface GoogleWorkspacePendingChanges {
  newCount: number;
  suspendedCount: number;
  removedCount: number;
  total: number;
}

interface GoogleWorkspaceIntegrationState {
  isLoading: boolean;
  isConnected: boolean;
  connectedByEmail: string | null;
  lastSyncedAt: string | null;
  pendingChanges: GoogleWorkspacePendingChanges | null;
  hasError: boolean;
  refresh: () => Promise<void>;
}

const EMPTY_PENDING: GoogleWorkspacePendingChanges = {
  newCount: 0,
  suspendedCount: 0,
  removedCount: 0,
  total: 0
};

/**
 * Shared read-only view of the org's Google Workspace connection + pending
 * sync changes. Used by the Directory "Import" flow and the pending-changes
 * banner so both stay in sync with the same source of truth.
 *
 * `enabled` should be false for non-Super-Admins so we never fire these
 * requests for roles that can't see the feature.
 */
export const useGoogleWorkspaceIntegration = (
  enabled: boolean
): GoogleWorkspaceIntegrationState => {
  const [isLoading, setIsLoading] = useState(enabled);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedByEmail, setConnectedByEmail] = useState<string | null>(
    null
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] =
    useState<GoogleWorkspacePendingChanges | null>(null);
  const [hasError, setHasError] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      // authFetch's baseURL already carries "/v1"; the integrations API
      // lives at "/api/v1" instead, so this must be an absolute URL or it
      // would resolve under "/v1/api/v1/...".
      const statusResp = await authFetch.get(
        `${getApiUrl()}/api/v1/integrations/google/status`
      );
      const connected = !!statusResp?.data?.connected;
      setIsConnected(connected);
      setConnectedByEmail(statusResp?.data?.connectedByEmail ?? null);

      if (!connected) {
        setPendingChanges(EMPTY_PENDING);
        setLastSyncedAt(null);
        return;
      }

      const [stagingResp, lastSyncResp] = await Promise.allSettled([
        authFetch.get("/people/sync/staging"),
        authFetch.get("/people/sync/staging/last-sync-changes")
      ]);

      if (stagingResp.status === "fulfilled") {
        const staging: any[] =
          stagingResp.value?.data?.results ?? stagingResp.value?.data ?? [];
        const records = Array.isArray(staging) ? staging : [];
        const pending = records.filter(
          (record) => !record?.decision || record.decision === "PENDING"
        );

        const newCount = pending.filter(
          (record) => record.changeType === "NEW"
        ).length;
        const removedCount = pending.filter(
          (record) => record.changeType === "REMOVED"
        ).length;
        const suspendedCount = pending.filter(
          (record) =>
            record.changeType !== "NEW" &&
            record.changeType !== "REMOVED" &&
            record.googleStatus === "SUSPENDED"
        ).length;

        setPendingChanges({
          newCount,
          suspendedCount,
          removedCount,
          total: newCount + suspendedCount + removedCount
        });
      } else {
        setHasError(true);
        setPendingChanges(null);
      }

      if (lastSyncResp.status === "fulfilled") {
        const lastSyncData =
          lastSyncResp.value?.data?.results?.[0] ?? lastSyncResp.value?.data;
        setLastSyncedAt(lastSyncData?.syncedAt ?? null);
      } else {
        setHasError(true);
        setLastSyncedAt(null);
      }
    } catch {
      // Fail open: a data error here should never hide/disable the entry
      // points, it should just degrade the display.
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    isLoading,
    isConnected,
    connectedByEmail,
    lastSyncedAt,
    pendingChanges,
    hasError,
    refresh: fetchStatus
  };
};

export default useGoogleWorkspaceIntegration;
