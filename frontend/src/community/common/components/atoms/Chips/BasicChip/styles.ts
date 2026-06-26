import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  chipContainer: {
    height: "auto",
    backgroundColor: "common.white",
    borderRadius: "4rem",
    py: "0.625rem",
    px: "1.25rem",
    color: theme.palette.text.secondary,
    fontWeight: "400",
    fontSize: ".875rem",
    lineHeight: "1.125rem",
    "& .MuiChip-label": {
      px: 0,
      whiteSpace: "nowrap",
      overflow: "hidden !important",
      textOverflow: "ellipsis",
      maxWidth: "100%"
    },
    "& .MuiChip-deleteIcon": {
      m: 0
    }
  }
});

export default styles;
