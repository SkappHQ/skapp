import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ButtonV2, Label } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetGoogleConnectionStatus,
  useGetLastSyncChanges,
  useGetStagingRecords
} from "~community/people/api/GoogleWorkspaceSyncApi";
import { StagingChangeType } from "~community/people/types/GoogleWorkspaceSyncTypes";

const STAGING_POLL_INTERVAL_MS = 5000;

const formatLastSynced = (
  isoString: string | undefined,
  translateText: (keys: string[], params?: Record<string, unknown>) => string
): string | null => {
  if (!isoString) return null;
  const diffMinutes = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 60000
  );
  if (diffMinutes < 1)
    return translateText(["googleWorkspaceSync", "lastSyncedJustNow"]);
  if (diffMinutes < 60)
    return translateText(["googleWorkspaceSync", "lastSyncedMinutes"], {
      count: diffMinutes
    });
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return translateText(["googleWorkspaceSync", "lastSyncedHours"], {
      count: diffHours
    });
  return translateText(["googleWorkspaceSync", "lastSyncedDays"], {
    count: Math.floor(diffHours / 24)
  });
};

const GoogleWorkspaceSyncBanner = () => {
  const theme = useTheme();
  const router = useRouter();
  const translateText = useTranslator("peopleModule", "peoples");

  const { data: connectionStatus } = useGetGoogleConnectionStatus();
  const isConnected = !!connectionStatus?.connected;

  const { data: stagingRecords } = useGetStagingRecords({
    enabled: isConnected,
    refetchInterval: STAGING_POLL_INTERVAL_MS
  });
  const { data: lastSyncChanges } = useGetLastSyncChanges(isConnected);

  const counts = useMemo(() => {
    const records = stagingRecords ?? [];
    return {
      newCount: records.filter((r) => r.changeType === StagingChangeType.NEW)
        .length,
      suspendedCount: records.filter(
        (r) =>
          r.changeType === StagingChangeType.UPDATED &&
          r.googleStatus === "SUSPENDED"
      ).length,
      removedCount: records.filter(
        (r) => r.changeType === StagingChangeType.REMOVED
      ).length
    };
  }, [stagingRecords]);

  const lastSyncedAt = lastSyncChanges?.[0]?.syncedAt;
  const totalPending =
    counts.newCount + counts.suspendedCount + counts.removedCount;

  if (!isConnected) return null;

  const isUpToDate = totalPending === 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
        // Always the org's chosen brand color — not a semantic status color —
        // so this banner looks the same whether or not anything is pending.
        backgroundColor: theme.palette.secondary.main,
        border: `0.0625rem solid ${theme.palette.secondary.dark}`,
        borderRadius: "0.5rem",
        padding: "0.75rem 1rem",
        marginBottom: "1.5rem"
      }}
    >
      <Stack gap="0.375rem">
        <Stack direction="row" alignItems="center" gap="0.75rem">
          <Icon name={IconName.INFO_ICON} fill={theme.palette.primary.dark} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: theme.palette.primary.dark }}
          >
            {translateText([
              "googleWorkspaceSync",
              isUpToDate ? "connectedTitle" : "changesDetectedTitle"
            ])}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" gap="0.75rem" flexWrap="wrap">
          {!isUpToDate && (
            <Stack direction="row" gap="0.375rem" flexWrap="wrap">
              {counts.newCount > 0 && (
                <Label
                  backgroundColor="bg-semantic-green-background"
                  textColor="text-semantic-green-text"
                >
                  {translateText(["googleWorkspaceSync", "newCountChip"], {
                    count: counts.newCount
                  })}
                </Label>
              )}
              {counts.suspendedCount > 0 && (
                <Label
                  backgroundColor="bg-semantic-amber-background"
                  textColor="text-semantic-amber-text"
                >
                  {translateText(
                    ["googleWorkspaceSync", "suspendedCountChip"],
                    { count: counts.suspendedCount }
                  )}
                </Label>
              )}
              {counts.removedCount > 0 && (
                <Label
                  backgroundColor="bg-semantic-red-background"
                  textColor="text-semantic-red-text"
                >
                  {translateText(["googleWorkspaceSync", "removedCountChip"], {
                    count: counts.removedCount
                  })}
                </Label>
              )}
            </Stack>
          )}

          {lastSyncedAt && (
            <Typography variant="body2" color="text.secondary">
              {translateText(["googleWorkspaceSync", "lastSyncedLabel"], {
                time: formatLastSynced(lastSyncedAt, translateText as any)
              })}
            </Typography>
          )}
        </Stack>
      </Stack>

      <ButtonV2
        variant={isUpToDate ? "tertiary" : "primary"}
        size="md"
        onClick={() => router.push(ROUTES.PEOPLE.SYNC_CHANGES)}
      >
        {translateText(["googleWorkspaceSync", "reviewChangesButton"])}
      </ButtonV2>
    </Box>
  );
};

export default GoogleWorkspaceSyncBanner;
