"use client";

import { Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/navigation";
import { FC } from "react";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";

/**
 * Shared error UI, ported from the Pages Router `_error.tsx`. Used both as the
 * `react-error-boundary` fallback inside the provider stack and by `error.tsx`.
 */
const ErrorFallback: FC = () => {
  const translateText = useTranslator("commonError");

  const router = useRouter();

  return (
    <Stack
      sx={{
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh"
      }}
      spacing={2}
    >
      <Typography variant="h1">{translateText(["title"])}</Typography>
      <Typography variant="body1">{translateText(["description"])}</Typography>
      <ButtonV2
        id="back-to-home-btn"
        isFullWidth={false}
        aria-label={translateText(["buttonText"])}
        onClick={() => {
          router.replace(ROUTES.DASHBOARD.BASE);
          // `router.reload()` has no App Router equivalent; a hard reload keeps
          // the original behaviour of remounting the whole tree after an error.
          window.location.assign(ROUTES.DASHBOARD.BASE);
        }}
      >
        {translateText(["buttonText"])}
      </ButtonV2>
    </Stack>
  );
};

export default ErrorFallback;
