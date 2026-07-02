import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { getApiUrl } from "~community/common/utils/getConstants";
import {
  GoogleConnectionStatus,
  LastSyncChangesEntry,
  StagingDecision,
  StagingRecord
} from "~community/people/types/GoogleWorkspaceSyncTypes";

// The Google OAuth controller lives under /api/v1/integrations/google, which
// is a different prefix to authFetch's default "/v1" base — build an absolute
// URL so axios bypasses the configured baseURL for these calls only.
const integrationsUrl = (path: string) =>
  `${getApiUrl()}/api/v1/integrations/google${path}`;

// These endpoints are polled on a fixed interval to pick up changes written
// by the Google Workspace webhook. The URL never changes between polls, so
// without this the browser (or an intermediate proxy) can silently serve a
// cached response instead of actually hitting the server on every tick.
// Deliberately just a query param, not Cache-Control/Pragma headers — custom
// headers aren't CORS-"simple", so adding them here would force a preflight
// on every poll, and if the backend's CORS config doesn't allow them the
// browser silently blocks the real request (looks exactly like "no data").
const noCacheConfig = () => ({
  params: { _: Date.now() }
});

export const googleWorkspaceQueryKeys = {
  CONNECTION_STATUS: ["google-workspace-connection-status"],
  STAGING_RECORDS: ["google-workspace-staging-records"],
  LAST_SYNC_CHANGES: ["google-workspace-last-sync-changes"]
};

export const useGetGoogleConnectionStatus = (
  enabled: boolean = true
): UseQueryResult<GoogleConnectionStatus> => {
  return useQuery({
    queryKey: googleWorkspaceQueryKeys.CONNECTION_STATUS,
    queryFn: async () => {
      const response = await authFetch.get(
        integrationsUrl("/status"),
        noCacheConfig()
      );
      return response.data as GoogleConnectionStatus;
    },
    enabled
  });
};

export const useInitiateGoogleConnect = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await authFetch.get(integrationsUrl("/initiate"));
      return response.data as { url: string };
    }
  });
};

// Repeated bulk syncs (auto or manual) can leave more than one staging row
// for the same person (e.g. one from an earlier sync that's still pending,
// one from a newer sync). Collapse those down to the most recently synced
// row per email so the same person never shows up twice in any list.
const dedupeByEmail = (records: StagingRecord[]): StagingRecord[] => {
  const latestByEmail = new Map<string, StagingRecord>();
  for (const record of records) {
    const existing = latestByEmail.get(record.email);
    if (!existing || new Date(record.syncedAt) >= new Date(existing.syncedAt)) {
      latestByEmail.set(record.email, record);
    }
  }
  return Array.from(latestByEmail.values());
};

export const useGetStagingRecords = (
  options?: { enabled?: boolean; refetchInterval?: number | false }
): UseQueryResult<StagingRecord[]> => {
  return useQuery({
    queryKey: googleWorkspaceQueryKeys.STAGING_RECORDS,
    queryFn: async () => {
      const response = await authFetch.get(
        "/people/sync/staging",
        noCacheConfig()
      );
      const results = (response.data?.results ?? []) as StagingRecord[];
      // The backend keeps every staging row indefinitely, including ones
      // already actioned in a previous review — only PENDING rows are
      // actual outstanding changes for the admin to act on.
      const pending = results.filter(
        (r) => r.decision === StagingDecision.PENDING
      );
      return dedupeByEmail(pending);
    },
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
    // Google's push notifications land on the backend at any time, not just
    // while this tab is focused/active — keep polling even when backgrounded
    // so changes show up without the user having to hit "Sync now".
    refetchIntervalInBackground: true,
    refetchOnMount: "always"
  });
};

export const useGetLastSyncChanges = (
  enabled: boolean = true
): UseQueryResult<LastSyncChangesEntry[]> => {
  return useQuery({
    queryKey: googleWorkspaceQueryKeys.LAST_SYNC_CHANGES,
    queryFn: async () => {
      const response = await authFetch.get(
        "/people/sync/staging/last-sync-changes",
        noCacheConfig()
      );
      return (response.data?.results ?? []) as LastSyncChangesEntry[];
    },
    enabled
  });
};

export const useApproveStaging = () => {
  const queryClient = useQueryClient();

  const invalidateStaging = () => {
    queryClient.invalidateQueries({
      queryKey: googleWorkspaceQueryKeys.STAGING_RECORDS
    });
    queryClient.invalidateQueries({
      queryKey: googleWorkspaceQueryKeys.LAST_SYNC_CHANGES
    });
  };

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await authFetch.post("/people/sync/staging/approve", {
        ids
      });
      return response.data;
    },
    // Approved rows should disappear from every staging list (banner, review
    // page, sync-changes page) as soon as the approval succeeds, not just on
    // the next poll tick. Invalidate immediately, then once more shortly
    // after in case the backend applies the decision change asynchronously
    // and an immediate refetch would still see the old PENDING rows.
    onSuccess: () => {
      invalidateStaging();
      setTimeout(invalidateStaging, 2000);
    }
  });
};

export const useTriggerBulkSync = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await authFetch.post(
        "/people/sync/external-bulk-person-sync"
      );
      return response.data;
    }
  });
};
