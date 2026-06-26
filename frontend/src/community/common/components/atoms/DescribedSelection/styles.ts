import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    display: "inline-block",
    maxWidth: "36.625rem",
    borderWidth: "0.0625rem",
    borderStyle: "solid",
    borderColor: theme.palette.grey.A100,
    background: theme.palette.grey[50],
    cursor: "pointer",
    borderRadius: "0.5rem",
    float: "inline-start"
  },
  errorWrapper: {
    borderColor: theme.palette.error.contrastText,
    background: theme.palette.error.light
  },
  animatedWrapper: {
    borderColor: theme.palette.secondary.dark,
    background: theme.palette.secondary.main,
    animation: "blink 1.5s ease-in-out infinite"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: "0.5rem 1rem",
    gap: "1rem"
  },
  iconWrapper: {
    height: "1.5rem",
    width: "1.5rem",
    alignItems: "center",
    justifyContent: "center"
  },
  contentWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: "1rem"
  },
  textWrapper: {
    flexDirection: "column",
    alignItems: "flex-start"
  }
});
