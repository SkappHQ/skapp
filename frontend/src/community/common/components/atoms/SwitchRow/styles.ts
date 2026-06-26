import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: "1.25rem"
  },
  label: {
    display: "flex",
    gap: "0.625rem"
  },
  error: { color: theme.palette.error.contrastText }
});

export default styles;
