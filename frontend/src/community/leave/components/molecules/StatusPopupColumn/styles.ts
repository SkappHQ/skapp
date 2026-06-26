import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme) => ({
  outerBox: {
    display: "flex",
    flexDirection: "column"
  },
  labelText: (error?: boolean) => ({
    marginBottom: "0.75rem",
    color: error ? theme.palette.error.contrastText : "black"
  }),
  textareaStyle: (error?: boolean) =>
    ({
      width: "100%",
      height: "5rem",
      background: error ? theme.palette.error.light : theme.palette.grey[100],
      borderRadius: "0.5rem",
      border: error ? `${theme.palette.error.contrastText} 1px solid` : "none",
      outline: "none",
      padding: "0.75rem",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "1rem",
      resize: "none"
    }) as StyleProps
});

export default styles;
