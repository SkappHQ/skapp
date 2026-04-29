import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  container: {
    padding: {
      xs: "0rem 2rem 1.875rem 2rem",
      lg: "1.125rem 3rem 1.875rem 3rem"
    },
    maxWidth: "103.125rem",
    width: "100%",
    height: "auto",
    overflowY: "auto",
    margin: "0rem auto"
  },
  header: {
    flexDirection: { xs: "column", sm: "row" },
    alignItems: { sm: "center" },
    justifyContent: { sm: "space-between" },
    gap: { xs: "1.25rem", sm: "0rem" },
    width: "100%"
  },
  leftContent: {
    flexDirection: "row",
    gap: "1.5rem",
    width: "fit-content",
    alignItems: "center"
  },
  leftArrowIconBtn: {
    width: "2.25rem",
    height: "2.25rem",
    backgroundColor: theme.palette.grey[100],
    border: `0.0625rem solid ${theme.palette.grey[300]}`,
    borderRadius: "100%",
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  },
  rightContent: {
    display: "flex",
    flexDirection: { xs: "column-reverse", sm: "row" },
    gap: "0.625rem"
  },
  dividerWrapper: {
    padding: "1rem 0rem 1rem 0rem"
  }
});

export default styles;
