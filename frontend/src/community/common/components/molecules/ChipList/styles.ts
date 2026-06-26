import { type Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  chipsWrapper: {
    flexDirection: "row",
    gap: "0.625rem",
    width: "100%",
    overflow: "hidden"
  },
  chips: {
    display: "inline-block",
    whiteSpace: "nowrap",
    wordBreak: "keep-all",
    fontSize: "0.875rem",
    lineHeight: "1rem",
    boxSizing: "border-box",
    width: "max-content",
    height: "2.5625rem",
    padding: "0.8125rem 1.25rem",
    borderWidth: "0.0625rem",
    borderStyle: "solid",
    borderRadius: "4rem",
    borderColor: "#D4D4D8",
    cursor: "default"
  },
  menu: {
    "& .MuiPaper-root": {
      display: "flex",
      borderRadius: "0.75rem",
      backgroundColor: theme.palette.notifyBadge.contrastText,
      position: "absolute",
      top: "0rem",
      left: "-1.25rem",
      zIndex: ZIndexEnums.POPOVER
    }
  },
  menuList: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    padding: "1rem 1.25rem",
    gap: "0.5rem"
  },
  menuItemRow: {
    display: "flex",
    gap: "0.5rem"
  },
  widthCounter: {
    visibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    maxWidth: { xs: "calc(100% - 7.1419rem)", md: "calc(100% - 13.1419rem)" },
    overflow: "hidden"
  }
});

export default styles;
