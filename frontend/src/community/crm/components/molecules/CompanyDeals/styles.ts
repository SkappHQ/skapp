import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1.5rem"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  divider: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: "1.75rem",
    color: theme.palette.text.primary
  },
  addButton: {
    textTransform: "none",
    backgroundColor: "#F4F4F5",
    border: "1px solid #E4E4E7",
    borderRadius: "0.5rem",
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
    fontWeight: 500,
    gap: "0.5rem",
    padding: "0.53125rem 1.25rem",
    height: "2rem",
    "&:hover": {
      backgroundColor: "#E4E4E7",
      border: "1px solid #E4E4E7"
    }
  }
});

export default styles;
