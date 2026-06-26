import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    maxWidth: "36.625rem",
    width: "100%"
  },
  containerOne: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    pb: "2.5rem"
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: "1rem"
  },
  asterisk: { color: theme.palette.error.contrastText },
  cardContainer: {
    gap: "1.25rem",
    mt: "1rem"
  },
  error: {
    color: theme.palette.error.contrastText,
    mt: "0.375rem"
  },
  divider: {
    my: "1.5rem"
  },
  switchRowWrapper: {
    flexDirection: "column",
    gap: "1.5rem"
  },
  tooltip: {
    justifyContent: "flex-start",
    gap: "0.625rem"
  },
  buttonWrapper: {
    flexDirection: { xs: "column-reverse", sm: "row" },
    gap: "0.75rem",
    marginY: "2rem"
  }
});
