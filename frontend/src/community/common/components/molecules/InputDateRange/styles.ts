import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  labelWrapper: {
    paddingRight: "0.875rem",
    justifyContent: "space-between"
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
