import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  container: {
    width: "100%",
    backgroundColor: theme.palette.grey[100],
    height: "16.5625rem",
    borderRadius: "0.75rem",
    padding: "0.75rem 1.5rem",
    gap: "2.625rem"
  },
  headerStack: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  titleSkeleton: {
    borderRadius: "0.75rem",
    backgroundColor: theme.palette.grey[200],
    width: "7.375rem",
    height: "2rem"
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    maxWidth: "18rem",
    height: "2rem",
    boxSizing: "border-box",
    padding: "0rem 0.625rem",
    gap: "0.625rem",
    borderRadius: "0.75rem",
    backgroundColor: theme.palette.grey[200]
  },
  buttonSkeleton: {
    borderRadius: "0.75rem",
    backgroundColor: theme.palette.grey[100],
    width: "4.6875rem",
    height: "1.5rem"
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "0.625rem",
    height: "100%"
  },
  barSkeleton: {
    borderRadius: "0.375rem",
    backgroundColor: theme.palette.grey[200],
    width: "0.375rem",
    height: "10.625rem"
  }
});

export default styles;
