import { Box, Typography } from "@mui/material";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { getAsDaysString } from "~community/common/utils/dateTimeUtils";
import { getStartEndDate } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";

interface Props {
  startDate: string;
  endDate: string;
  days: number;
}

const RequestDates: FC<Props> = ({ startDate, endDate, days }) => {
  const translateText = useTranslator("leaveModule", "myRequests");

  return (
    <Box
      sx={{
        color: "common.black",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "0.625rem"
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "common.black",
          whiteSpace: "nowrap"
        }}
      >
        {getStartEndDate(startDate, endDate)}
      </Typography>
      <div
        style={{
          backgroundColor: "var(--color-tertiary-background)",
          borderRadius: "9.375rem",
          padding: "0.5rem 1rem"
        }}
      >
        {days == 1
          ? translateText(["myLeaveRequests", "fullDay"])
          : days < 1
            ? translateText(["myLeaveRequests", "halfDay"])
            : getAsDaysString(days)}
      </div>
    </Box>
  );
};

export default RequestDates;
