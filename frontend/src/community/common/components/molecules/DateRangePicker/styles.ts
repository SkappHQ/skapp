import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: { flexDirection: "row", alignItems: "center" },
  iconWrapper: { pr: "0.4375rem" },
  chip: {
    cursor: "pointer",
    minWidth: "8.75rem",
    padding: "0.3125rem 0.375rem",
    height: "2rem",
    backgroundColor: theme.palette.grey[100]
  },
  popper: {
    zIndex: ZIndexEnums.POPOVER,
    marginTop: "0.1875rem !important",
    marginBottom: "0.1875rem !important"
  },
  leftArrowIcon: {
    "&.Mui-disabled": {
      visibility: "hidden"
    }
  },
  rightArrowIcon: {
    "&.Mui-disabled": {
      visibility: "hidden"
    }
  }
});

export default styles;
