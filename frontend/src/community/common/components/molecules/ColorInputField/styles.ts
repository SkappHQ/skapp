import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (theme: Theme, error: string): StyleProps => ({
  container: {
    mt: "1.5rem"
  },
  label: {
    fontWeight: 500,
    color: error ? theme.palette.error.contrastText : "common.black"
  },
  colorContainer: {
    mt: "1.3125rem",
    borderRadius: "0.5rem",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    border: error
      ? `${theme.palette.error.contrastText} 0.0625rem solid`
      : "none"
  },
  errorText: {
    color: theme.palette.error.contrastText
  }
});
