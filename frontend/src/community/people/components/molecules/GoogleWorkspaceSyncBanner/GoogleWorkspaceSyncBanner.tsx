import { Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { JSX } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import { fromDateToRelativeTime } from "~community/common/utils/dateTimeUtils";
import { useGoogleWorkspaceIntegration } from "~community/people/hooks/useGoogleWorkspaceIntegration";
import i18n from "~i18n";

/**
 * Directory-page banner that surfaces pending Google Workspace sync changes
 * (new / suspended / removed members) to the Super Admin, with a shortcut
 * into the review flow on the Settings > Account page.
 *
 * Only renders when: the viewer is a Super Admin, Google Workspace is
 * connected, and there's something to review (or the status fetch failed —
 * fails open rather than hiding the entry point).
 */
const GoogleWorkspaceSyncBanner = (): JSX.Element | null => {
  const theme = useTheme();
  const router = useRouter();
  const translateText = useTranslator("peopleModule", "peoples");
  const { user } = useAuth();

  const isSuperAdmin = !!user?.roles?.includes(AdminTypes.SUPER_ADMIN);

  const { isLoading, isConnected, pendingChanges, lastSyncedAt, hasError } =
    useGoogleWorkspaceIntegration(isSuperAdmin);

  if (!isSuperAdmin || isLoading || !isConnected) return null;

  const total = pendingChanges?.total ?? 0;
  if (!hasError && total === 0) return null;

  const relativeTime = lastSyncedAt
    ? fromDateToRelativeTime(lastSyncedAt, translateText, i18n.language)
    : null;

  const handleReviewChanges = (): void => {
    router.push(`${ROUTES.SETTINGS.BASE}?tab=account`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        backgroundColor: theme.palette.primary.light,
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: "8px",
        padding: "0.875rem 1.25rem",
        marginBottom: "1rem"
      }}
    >
      <Stack direction="row" sx={{ gap: "0.75rem", alignItems: "flex-start" }}>
        <Icon name={IconName.INFO_ICON} />
        <Stack sx={{ gap: "0.375rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {translateText(["googleWorkspaceSyncBanner", "title"])}
          </Typography>
          {hasError ? (
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {translateText(["googleWorkspaceSyncBanner", "statusUnavailable"])}
            </Typography>
          ) : (
            <Stack
              direction="row"
              sx={{ gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}
            >
              {!!pendingChanges?.newCount && (
                <Chip
                  size="small"
                  color="primary"
                  label={translateText(
                    ["googleWorkspaceSyncBanner", "newChip"],
                    { count: pendingChanges.newCount }
                  )}
                />
              )}
              {!!pendingChanges?.suspendedCount && (
                <Chip
                  size="small"
                  color="warning"
                  label={translateText(
                    ["googleWorkspaceSyncBanner", "suspendedChip"],
                    { count: pendingChanges.suspendedCount }
                  )}
                />
              )}
              {!!pendingChanges?.removedCount && (
                <Chip
                  size="small"
                  color="error"
                  label={translateText(
                    ["googleWorkspaceSyncBanner", "removedChip"],
                    { count: pendingChanges.removedCount }
                  )}
                />
              )}
              {relativeTime && (
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {translateText(["googleWorkspaceSyncBanner", "lastSynced"], {
                    time: relativeTime
                  })}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>

      <ButtonV2 variant="primary" size="md" onClick={handleReviewChanges}>
        {translateText(["googleWorkspaceSyncBanner", "reviewChanges"])}
      </ButtonV2>
    </Box>
  );
};

export default GoogleWorkspaceSyncBanner;
