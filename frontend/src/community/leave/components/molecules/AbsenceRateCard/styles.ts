import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  analytic: { fontSize: "2rem", fontWeight: 700 },
  content: { display: "flex", alignItems: "center" },
  error: { pt: 1.5, color: theme.palette.text.textGrey },
  trendChip: {
    [theme.breakpoints.down("md")]: {
      fontSize: "0.625rem",
      lineHeight: "0.625rem"
    },
    ml: 1,
    fontSize: "0.75rem"
  }
});

export default styles;
