import { Box, useTheme } from "@mui/material";
import { JSX } from "react";

import { MAX_NOTIFICATION_COUNT } from "~community/common/constants/commonConstants";

interface NotificationBadgeProps {
  count: number;
  show?: boolean;
}

const NotificationBadge = ({
  count,
  show = true
}: NotificationBadgeProps): JSX.Element | null => {
  const theme = useTheme();

  if (!show) return null;

  const displayCount =
    count > MAX_NOTIFICATION_COUNT ? `${MAX_NOTIFICATION_COUNT}+` : count;

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
      {displayCount}
    </Box>
  );
};

export default NotificationBadge;
