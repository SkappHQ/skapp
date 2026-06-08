import { Box, CircularProgress, useTheme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  fullPage?: boolean;
}

const FullScreenLoader = ({ fullPage = true }: Props) => {
  const theme = useTheme();
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "contentAreaLoader"
  );

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

export default FullScreenLoader;
