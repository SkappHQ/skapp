import { Box, CircularProgress } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import useRouteLoading from "~community/common/hooks/useRouteLoading";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";

interface Props {
  fullPage?: boolean;
}

const ContentAreaLoader = ({ fullPage = false }: Props) => {
  const loading = useRouteLoading();
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "contentAreaLoader"
  );

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: fullPage ? "fixed" : "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        zIndex: ZIndexEnums.MAX
      }}
      role="status"
      aria-live="polite"
      aria-label={translateAria(["loading"])}
    >
      <CircularProgress
        sx={{ color: theme.palette.primary.light }}
        aria-hidden="true"
      />
    </Box>
  );
};

export default ContentAreaLoader;
