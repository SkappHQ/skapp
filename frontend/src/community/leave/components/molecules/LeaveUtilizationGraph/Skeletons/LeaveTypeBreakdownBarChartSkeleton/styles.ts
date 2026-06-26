import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  container: {
    flexDirection: "column",
    height: "11.25rem",
    width: "100%"
  },
  chartWrapper: {
    position: "relative",
    height: "9.375rem",
    width: "100%"
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "0.0625rem",
    backgroundColor: theme.palette.grey[200]
  },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%"
  },

  barSkeleton: {
    borderRadius: "0.5rem 0.5rem 0 0",
    backgroundColor: theme.palette.grey[200],
    minWidth: "1.875rem",
    width: "max-content",
    maxWidth: "2.5rem",
    height: "9.25rem"
  }
});

export default styles;
