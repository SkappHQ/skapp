import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    mt: "1.5rem",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0.5rem",
    border: "none",
    gap: "0.125rem"
  },
  container: { zIndex: ZIndexEnums.MIN },
  dateWrapper: {
    color: "common.black",
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: "0.625rem",
    flex: 2
  }
});
