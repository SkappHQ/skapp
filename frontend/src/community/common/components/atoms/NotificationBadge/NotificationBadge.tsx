import { Box, useTheme } from "@mui/material";
import { JSX } from "react";

interface NotificationBadgeProps {
  count: number | string;
  show?: boolean;
}

const NotificationBadge = ({
  count,
  show = true
}: NotificationBadgeProps): JSX.Element | null => {
  const theme = useTheme();

  if (!show) return null;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.error.contrastText,
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: "0.75rem",
        minWidth: "1.25rem",
        height: "1.25rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.25rem",
        flexShrink: 0
      }}
    >
      {count}
    </Box>
  );
};

export default NotificationBadge;
