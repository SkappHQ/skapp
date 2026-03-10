import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const styles = (theme: Theme) => ({
  boxContainer: {
    ".MuiPopper-root": { zIndex: ZIndexEnums.DEFAULT }
  },
  popperStyle: {
    zIndex: ZIndexEnums.POPOVER
  },
  boxBodyStyle: {
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: `0rem 0rem 0.9375rem 0.3125rem ${theme.palette.grey.A200}`,
    backgroundColor: "white"
  }
});

export default styles;
