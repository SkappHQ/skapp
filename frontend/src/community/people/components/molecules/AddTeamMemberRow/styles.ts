import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  jobTitle: {
    fontSize: "0.75rem",
    fontWeight: 400,
    color: theme.palette.primary.dark,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  dropDownBtn: {
    p: "0.625rem 1rem",
    lineHeight: "1rem",
    fontSize: "0.875rem"
  }
});

export default styles;
