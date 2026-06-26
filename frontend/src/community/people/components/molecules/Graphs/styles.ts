import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  graphContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0rem",
    gap: "0.125rem",
    width: "100%",
    height: "100%",
    minHeight: "10.9375rem",
    position: "relative"
  },
  graphPanel: {
    padding: ".75rem 1.5rem",
    backgroundColor: theme.palette.grey[50],
    borderRadius: ".75rem",
    height: "100%",
    width: "100%"
  },
  graphHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  title: {
    fontWeight: 700
  }
});

export default styles;
