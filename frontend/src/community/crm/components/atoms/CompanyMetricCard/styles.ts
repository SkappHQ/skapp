import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "0.25rem",
    border: `0.0625rem solid ${theme.palette.divider}`,
    borderRadius: "0.75rem",
    padding: "0.75rem"
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: "1.25rem",
    color: theme.palette.text.secondary
  },
  valueRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.75rem"
  },
  amount: {
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: "2rem",
    color: theme.palette.text.primary
  }
});

export default styles;