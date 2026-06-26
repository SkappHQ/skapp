import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { LeaveStates } from "~community/common/types/CommonTypes";

const styles = (theme: Theme) => ({
  boxLeaveEmojiStyle: {
    borderRadius: "1rem",
    width: "1.3rem",
    height: "1.3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  circularProgressLeaveEmojiStyle: (leaveType: string) => ({
    transform:
      leaveType === LeaveStates.MORNING
        ? "rotate(90deg) !important"
        : "rotate(-90deg) !important",
    position: "absolute",
    color: `${theme.palette.error.contrastText} !important`,
    background: "transparent !important"
  }),
  stackContainerStyle: {
    width: "max-content",
    height: "4rem",
    background: theme.palette.grey[50],
    borderWidth: "0.063rem 0rem",
    borderStyle: "solid",
    borderColor: theme.palette.grey[100],
    position: "relative",
    [theme.breakpoints.down("xl")]: {
      width: "max-content"
    },
    cursor: "pointer",
    "&:hover": {
      background: theme.palette.grey[100],
      "& > :first-child": {
        background: theme.palette.grey[100]
      }
    },
    "&:focus": {
      zIndex: ZIndexEnums.DEFAULT
    }
  },
  boxContainerStyle: (isDrawerToggled: boolean) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1.5,
    padding: "1.3rem 1rem",
    minWidth: "18rem",
    maxWidth: "18rem",
    position: "sticky",
    left: 0,
    zIndex: ZIndexEnums.DEFAULT,
    [theme.breakpoints.down("lg")]: {
      flex: 0.5,
      minWidth: "18rem",
      maxWidth: "18rem"
    },
    ...(isDrawerToggled && {
      [theme.breakpoints.up("xl")]: { flex: 1.5 }
    }),
    background: theme.palette.grey[50],
    borderRight: "0.063rem solid",
    borderColor: theme.palette.grey[200]
  }),
  dateFontStyle: {
    letterSpacing: "0.03em",
    width: "9rem"
  },
  workedHoursFontStyle: {
    letterSpacing: "0.03em",
    ml: "1.4rem",
    display: "flex",
    flexDirection: "row",
    gap: "0.3125rem"
  }
});

export default styles;
