import { Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import { NextRouter, useRouter } from "next/router";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";

export const Custom404: NextPage = () => {
  const translateText = useTranslator("notFound");
  const router: NextRouter = useRouter();
  return (
    <Stack
      sx={{
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
      }}
      spacing={2}
    >
      <Typography variant="h1">404 - {translateText(["title"])}</Typography>
      <Typography variant="body1">{translateText(["description"])}</Typography>
      <ButtonV2
        id="back-to-home-btn"
        isFullWidth={false}
        aria-label={translateText(["buttonText"])}
        onClick={() => router.push(ROUTES.DASHBOARD.BASE)}
        style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
      >
        {translateText(["buttonText"])}
      </ButtonV2>
    </Stack>
  );
};
export default Custom404;
