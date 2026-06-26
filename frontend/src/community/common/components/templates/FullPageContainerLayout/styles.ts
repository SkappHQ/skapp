import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    height: "max-content",
    width: "100%",
    overflowY: "auto"
  },
  container: {
    height: "100%",
    width: "100%",
    maxWidth: "103.125rem",
    padding: {
      xs: "1.875rem 2rem",
      lg: "1.875rem 3rem"
    },
    margin: "0rem auto"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: "0.75rem",
    width: "100%"
  },
  iconBtn: {
    width: "2.25rem",
    height: "2.25rem",
    backgroundColor: theme.palette.grey[100],
    border: `0.0625rem solid ${theme.palette.grey[300]}`,
    borderRadius: "100%",
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: "0.75rem"
  },
  stepText: {
    color: theme.palette.primary.dark
  }
});

export default styles;
