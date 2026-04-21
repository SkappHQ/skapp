import { Box, useTheme } from "@mui/material";
import { JSX } from "react";

interface NotificationDotProps {
  show?: boolean;
}

const NotificationDot = ({
  show = true
}: NotificationDotProps): JSX.Element | null => {
  const theme = useTheme();

  if (!show) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "-4px",
        right: "-3px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: theme.palette.error.contrastText
      }}
    />
  );
};

export default NotificationDot;
