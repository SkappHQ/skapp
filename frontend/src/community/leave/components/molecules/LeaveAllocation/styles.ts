import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  innerBox: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0.5rem"
  },
  buttonFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "end",
    gap: "0.5rem",
    marginTop: "0.75rem"
  },
  button: {
    backgroundColor: theme.palette.common.white,
    width: "2.5rem",
    height: "2.5rem",
    border: `.0625rem solid ${theme.palette.grey[500]}`,
    borderRadius: "0.25rem"
  }
});

export default styles;
