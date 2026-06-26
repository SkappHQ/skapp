import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    width: "100%",
    maxWidth: "100%",
    gap: "0.5rem"
  },
  labelWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  asterisk: { color: theme.palette.error.contrastText },
  container: {
    position: "relative",
    height: "2.9056rem",
    width: "100%"
  },
  field: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "0.5781rem 0.75rem",
    borderRadius: "0.5rem"
  },
  colorWidgetWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "0.75rem"
  },
  colorWidget: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "50%",
    cursor: "pointer",
    "&:focus-visible": {
      outline: "none",
      border: `0.125rem solid ${theme.palette.common.black}`
    }
  },
  dropDownButtonWrapper: {
    cursor: "pointer",
    outline: "none",
    height: "min-content",
    borderRadius: "100%",
    "&:focus-visible": {
      outline: "none",
      outlineOffset: "-0.25rem",
      border: `0.125rem solid ${theme.palette.common.black}`
    }
  },
  dropDownButton: {
    width: "1.75rem",
    height: "1.75rem",
    justifyContent: "center",
    alignItems: "center"
  },
  error: {
    color: theme.palette.error.contrastText
  }
});
