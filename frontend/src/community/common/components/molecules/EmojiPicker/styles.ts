import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (theme: Theme): StyleProps => ({
  labelWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  asterisk: { color: theme.palette.error.contrastText },
  paper: {
    position: "relative",
    display: "flex",
    borderRadius: "0.5rem",
    marginTop: "0.5rem"
  },
  input: {
    flex: 1,
    "&& .MuiInputBase-input": {
      p: "0.75rem 1rem",
      "&.Mui-disabled": {
        WebkitTextFillColor: theme.palette.grey[700]
      }
    },
    color: theme.palette.text.secondary,
    fontSize: "1rem",
    fontWeight: 400
  },
  error: {
    color: theme.palette.error.contrastText,
    marginTop: "0.5rem"
  },
  popperWrapper: { marginTop: "0.75rem", width: "100%", height: "100%" }
});
