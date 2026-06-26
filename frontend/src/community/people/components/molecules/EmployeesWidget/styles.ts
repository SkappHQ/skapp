import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  widgetContainer: {
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
  widgetPanel: {
    padding: ".75rem 1.5rem",
    backgroundColor: theme.palette.grey[50],
    borderRadius: ".75rem",
    height: "100%",
    width: "100%",
    minHeight: "10.9375rem"
  },
  widgetHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  widgetBody: {
    height: "13rem",
    overflowY: "scroll"
  },
  title: {
    fontWeight: 700
  },
  search: {
    margin: "1rem 0rem .75rem 0rem"
  },
  listItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: ".75rem",
    cursor: "pointer"
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem"
  },
  pendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    backgroundColor: theme.palette.amber.light,
    color: theme.palette.amber.dark,
    padding: "0.25rem",
    borderRadius: 10,
    fontSize: "0.625rem"
  },
  name: { lineHeight: "1.4", fontSize: "0.875rem" },
  email: {
    lineHeight: "1.4",
    fontSize: "0.875rem",
    color: theme.palette.grey[700]
  }
});

export default styles;
