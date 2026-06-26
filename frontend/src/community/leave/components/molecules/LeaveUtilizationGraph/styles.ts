import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  container: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: ".75rem",
    display: "flex",
    flexDirection: "column",
    padding: ".9375rem 1.5rem",
    minHeight: "18.6875rem"
  },
  innerContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  loadingPlaceholder: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%"
  },
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%"
  },
  chartContainer: {
    width: "100%",
    height: "18.75rem"
  }
});

export default styles;
