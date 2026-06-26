import { type Theme } from "@mui/material";

import { type StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  popperContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "0.75rem",
    width: "150px",
    backgroundColor: theme.palette.background.paper
  },
  linkText: {
    textDecoration: "underline",
    color: "blue"
  }
});

export default styles;
