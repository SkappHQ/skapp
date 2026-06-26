import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  monthSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    px: "0.625rem",
    pt: "0.3125rem"
  },
  iconText: {
    color: theme.palette.grey[200],
    fontSize: "0.625rem",
    fontWeight: 300
  },
  monthList: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    px: "0.9375rem"
  }
});

export default styles;
