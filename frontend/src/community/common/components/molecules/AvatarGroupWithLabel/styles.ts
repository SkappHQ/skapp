import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    position: "relative",
    flexDirection: "row"
  },
  componentStyles: {
    ".MuiAvatarGroup-avatar": {
      flexDirection: "row-reverse",
      height: "2.25rem",
      width: "2.25rem",
      fontSize: "0.875rem",
      fontWeight: 400,
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[400]
    }
  },
  chip: {
    position: "absolute",
    right: "-2.5rem",
    bottom: "0rem",
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    lineHeight: "1.313rem",
    maxWidth: "3.75rem",
    zIndex: ZIndexEnums.DEFAULT
  }
});

export default styles;
