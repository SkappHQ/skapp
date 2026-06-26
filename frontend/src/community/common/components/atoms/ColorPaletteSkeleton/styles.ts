import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (theme: Theme): StyleProps => ({
  label: {
    fontWeight: 500,
    fontSize: "1rem",
    color: "common.black",
    marginTop: "1rem",
    marginBottom: ".3rem"
  },
  wrapper: {
    display: "flex",
    flexDirection: "row",
    bgcolor: theme.palette.grey[100],
    padding: ".75rem 0rem .75rem 0rem",
    borderRadius: ".5rem",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    border: "none",
    maxHeight: "3.125rem"
  },
  skeleton: {
    borderRadius: "50%",
    marginX: ".375rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer"
  }
});
