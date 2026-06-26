import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  pagination: {
    marginTop: "0.875rem",
    marginLeft: "0.75rem",
    ".MuiPaginationItem-root": {
      backgroundColor: "common.white",
      "&:focus-visible": {
        outline: `0.125rem solid ${theme.palette.common.black}`,
        outlineOffset: "-0.125rem"
      }
    },
    ".MuiPaginationItem-ellipsis": {
      borderRadius: "0.25rem",
      textAlign: "center",
      minWidth: theme.breakpoints.down("lg") ? "1.625rem" : "2rem",
      height: theme.breakpoints.down("lg") ? "1.625rem" : "2rem",
      padding: "0 0.375rem",
      margin: "0 0.1875rem",
      border: `0.0625rem solid ${theme.palette.grey[200]}`
    },
    "&& .Mui-selected": {
      color: "common.black",
      border: `0.0625rem solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.grey[100]
    }
  }
});

export default styles;
