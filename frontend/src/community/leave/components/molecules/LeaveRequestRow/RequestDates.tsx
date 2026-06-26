import { Box, Theme, Typography, useTheme } from "@mui/material";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  dates: string;
  days: string;
}
const RequestDates: FC<Props> = ({ dates, days }) => {
  const theme: Theme = useTheme();
  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  return (
    <Box
      sx={{
        color: "common.black",
        display: "flex",
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "0.625rem",
        minWidth: "10.625rem",
        paddingLeft: "1.25rem"
      }}
      aria-label={translateAria(["leaveDuration"], {
        day: days,
        date: dates
      })}
    >
      <Typography
        variant="body2"
        sx={{
          color: "common.black",
          whiteSpace: "nowrap"
        }}
        aria-hidden="true"
      >
        {dates}
      </Typography>
      <div
        style={{
          backgroundColor: theme.palette.common.white,
          borderRadius: "9.375rem",
          padding: "0.5rem 1rem"
        }}
        aria-hidden="true"
      >
        {days}
      </div>
    </Box>
  );
};

export default RequestDates;
