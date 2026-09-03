import { type Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: { width: "min-content" },
  menuIcon: { cursor: "pointer" },
  menu: {
    "& .MuiPaper-root": {
      display: "flex",
      flexDirection: "column",
      borderRadius: "0.75rem",
      backgroundColor: theme.palette.notifyBadge.contrastText,
      position: "absolute",
      top: "0rem",
      left: "-1.25rem",
      zIndex: ZIndexEnums.POPOVER
    }
  },
  menuItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.8rem"
  },
  menuItemText: {
    fontSize: "0.875rem",
    fontWeight: 400
  }
});

export default styles;
