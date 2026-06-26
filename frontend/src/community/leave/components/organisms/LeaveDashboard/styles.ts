import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  container: {
    border: `0.0625rem solid ${theme.palette.grey[200]}`,
    p: 2,
    borderRadius: "0.75rem",
    width: "100%"
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: ".75rem"
  },
  analytic: { fontSize: "2rem", fontWeight: 700 },
  hires: { display: "flex", gap: ".25rem" },
  yrs: { marginTop: "1rem", marginLeft: ".5rem" },
  iconUp: {
    marginLeft: ".5rem",
    color: theme.palette.greens.darkBoarder,
    marginBottom: ".75rem",
    marginTop: ".75rem"
  },
  iconDown: {
    marginLeft: ".5rem",
    color: theme.palette.error.contrastText,
    marginBottom: ".75rem",
    marginTop: ".75rem"
  },
  widgets: { margin: "1rem 0rem" }
});

export default styles;
