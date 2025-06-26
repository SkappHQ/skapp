import { Box, CircularProgress, useTheme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { theme } from "~community/common/theme/theme";

const FullScreenLoader = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: ZIndexEnums.MAX
      }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.light }} />
    </Box>
  );
};

export default FullScreenLoader;
