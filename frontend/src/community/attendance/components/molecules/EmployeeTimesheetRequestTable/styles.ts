import { Theme } from "@mui/material";

import { TimeRequestDataType } from "~community/attendance/types/timeSheetTypes";

const styles = (theme: Theme) => ({
  tableContainerStyles: {
    borderTopLeftRadius: "0",
    borderTopRightRadius: "0",
    maxHeight: "60rem"
  },
  tableHeaderStyles: {
    textAlign: "center"
  },
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
  innerBoxWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    bgcolor: "white",
    paddingX: "1.25rem",
    paddingY: "0.625rem",
    borderRadius: "4rem",
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
  workHoursTextStyle: (
    timesheetRequest: TimeRequestDataType,
    totalHours: number
  ) => ({
    letterSpacing: "0.03em",
    color: theme.palette.text.secondary,
    whiteSpace: "nowrap",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    backgroundColor:
      timesheetRequest?.workHours >= totalHours
        ? theme.palette.grey[200]
        : theme.palette.error.main,
    py: "0.25rem",
    px: "1rem",
    borderRadius: "4rem"
  }),
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
  iconChipStyles: {
    color: theme.palette.text.secondary,
    minWidth: "6.875rem",
    justifyContent: "center",
    pr: "0rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "0rem",
      gap: "1rem"
    }
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
