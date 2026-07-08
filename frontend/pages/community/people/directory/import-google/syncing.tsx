import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowRightIcon, ProgressBar } from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useTriggerBulkSync } from "~community/people/api/GoogleWorkspaceSyncApi";

// The bulk sync is an async, backend-only job (the admin gets an email when
// it's actually done) — there's no endpoint that reports real progress. This
// animates a believable progress bar for a fixed duration instead, then
// hands off to the review page, which keeps polling for the real staging
// data on its own regardless of how far this animation got.
const SYNC_ANIMATION_DURATION_MS = 4000;
const SYNC_ANIMATION_TICK_MS = 100;
const SYNC_ANIMATION_CAP_PERCENT = 95;

const SyncingPage: NextPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples");
  const { mutate: triggerBulkSync } = useTriggerBulkSync();

  const [progress, setProgress] = useState(0);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    triggerBulkSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ticks = SYNC_ANIMATION_DURATION_MS / SYNC_ANIMATION_TICK_MS;
    const increment = SYNC_ANIMATION_CAP_PERCENT / ticks;

    const interval = setInterval(() => {
      setProgress((prev) =>
        Math.min(prev + increment, SYNC_ANIMATION_CAP_PERCENT)
      );
    }, SYNC_ANIMATION_TICK_MS);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
    }, SYNC_ANIMATION_DURATION_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (progress < 100 || hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    const timeout = setTimeout(() => {
      router.replace(ROUTES.PEOPLE.GOOGLE_IMPORT_REVIEW);
    }, 300);
    return () => clearTimeout(timeout);
  }, [progress, router]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        backgroundColor: theme.palette.common.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Stack
        sx={{
          width: "726px",
          gap: "48px",
          alignItems: "center"
        }}
      >
        <Stack direction="row" alignItems="center" gap="0.75rem">
          <Icon name={IconName.GOOGLE_ICON} width="40" height="40" />
          <ArrowRightIcon />
          <Icon name={IconName.SKAPP_ICON} width="40" height="40" />
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {translateText(["googleWorkspaceImport", "syncingTitle"])}
        </Typography>

        <Box sx={{ width: "20rem" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: "0.375rem" }}
          >
            <Typography
              variant="body2"
              sx={{ color: theme.palette.common.black }}
            >
              {translateText([
                "googleWorkspaceImport",
                "syncingProgressLabel"
              ])}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {Math.round(progress)}%
            </Typography>
          </Stack>
          <ProgressBar
            mode="single"
            progress={progress}
            max={100}
            backgroundColor="bg-gray-200"
            height="h-2"
            width="w-full"
            screenReaderText={`${Math.round(progress)}%`}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default SyncingPage;
