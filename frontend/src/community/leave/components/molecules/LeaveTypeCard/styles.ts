import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  activeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    minHeight: "7.5rem",
    padding: "1rem",
    background: theme.palette.grey[100],
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "0.3s",
    "&:hover": {
      background: theme.palette.secondary.main,
      outline: `0.0625rem solid ${theme.palette.secondary.dark}`
    }
  },
  disabledCard: {
    color: theme.palette.grey[600],
    filter: "saturate(0)",
    "& .MuiTypography-root": {
      color: theme.palette.grey[700]
    }
  },

  leftContent: {
    gap: "1.125rem"
  },
  amount: {
    flexDirection: "row",
    alignItems: "baseline"
  },
  heading: {
    fontWeight: 400,
    fontSize: "2.5rem",
    lineHeight: "2.5rem"
  },
  rightContent: {
    width: "max-content"
  }
});

export default styles;
