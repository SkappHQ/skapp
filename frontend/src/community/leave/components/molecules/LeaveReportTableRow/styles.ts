import { Theme } from "@mui/material/styles";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

export const tableRowStyles = (theme: Theme) => ({
  rowContainer: {
    width: "max-content",
    height: "4.3rem",
    background: theme.palette.grey[50],
    borderWidth: "0.063rem 0rem",
    borderStyle: "solid",
    borderColor: theme.palette.grey[100],
    position: "relative",
    [theme.breakpoints.down("xl")]: {
      width: "max-content"
    }
  },
  stickyColumn: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    zIndex: ZIndexEnums.LEVEL_2,
    padding: "0.5rem 1rem",
    minWidth: "15rem",
    maxWidth: "15rem",
    background: theme.palette.grey[50],
    position: "sticky",
    left: 0,
    [theme.breakpoints.down("lg")]: {
      flex: 0.5,
      minWidth: "10rem",
      maxWidth: "10rem"
    },
    height: "100%",
    borderRightWidth: "0.063rem",
    borderRightStyle: "solid",
    borderRightColor: theme.palette.grey[500]
  },
  cell: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: "6.5rem",
    maxWidth: "6.9rem",
    [theme.breakpoints.down("xl")]: {
      maxWidth: "6.9rem"
    },
    [theme.breakpoints.down("lg")]: {
      maxWidth: "2rem"
    },
    height: "4.3rem",
    zIndex: ZIndexEnums.DEFAULT
  },
  holidayText: {
    letterSpacing: "0.03em",
    color: theme.palette.text.secondary,
    whiteSpace: "nowrap",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  errorBox: {
    backgroundColor: theme.palette.error.main,
    px: "1rem",
    py: "0.25rem",
    borderRadius: "0.75rem"
  }
});
