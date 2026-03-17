import { Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { NextRouter, useRouter } from "next/router";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";

const Error = () => {
  const translateText = useTranslator("commonError");

  const router: NextRouter = useRouter();

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
        onClick={async () => {
          await router.replace(ROUTES.DASHBOARD.BASE);
          router.reload();
        }}
      >
        {translateText(["buttonText"])}
      </ButtonV2>
    </Stack>
  );
};

export default Error;
