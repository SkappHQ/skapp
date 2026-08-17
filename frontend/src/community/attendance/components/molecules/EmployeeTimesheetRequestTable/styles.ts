import { Theme } from "@mui/material";

import { TimeRequestDataType } from "~community/attendance/types/timeSheetTypes";

const styles = (theme: Theme) => ({
  boxDateContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.7,
    maxWidth: "auto"
  },
  textDateStyles: {
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  outerBoxWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    maxWidth: "auto"
  },
  timeBadgeContentStyles: {
    display: "inline-flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column"
    }
  },
  startTimeTextStyles: (timesheetRequest: TimeRequestDataType) => ({
    letterSpacing: "0.03em",
    color: theme.palette.text.secondary,
    whiteSpace: "nowrap",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textDecoration:
      timesheetRequest?.requestedStartTime &&
      timesheetRequest?.requestedStartTime !== timesheetRequest?.initialClockIn
        ? "line-through"
        : ""
  }),
  errorTextStyles: {
    letterSpacing: "0.03em",
    color: theme.palette.error.contrastText,
    whiteSpace: "nowrap",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  endTimeTextStyles: (timesheetRequest: TimeRequestDataType) => ({
    letterSpacing: "0.03em",
    color: theme.palette.text.secondary,
    whiteSpace: "nowrap",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textDecoration:
      timesheetRequest?.requestedEndTime &&
      timesheetRequest?.requestedEndTime !== timesheetRequest?.initialClockOut
        ? "line-through"
        : ""
  }),
  workHoursBoxStyle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    maxWidth: "auto"
  },
  statusOuterBoxStyles: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    maxWidth: "auto",
    [theme.breakpoints.down("lg")]: {
      justifyContent: "center"
    },
    position: "relative"
  },
  kebabMenuBoxStyle: {
    position: "absolute",
    right: "10%",
    [theme.breakpoints.down("xl")]: {
      right: "5%"
    },
    [theme.breakpoints.down("lg")]: {
      right: "0%"
    },
    [theme.breakpoints.down("md")]: {
      right: "5%"
    }
  }
});

export default styles;
